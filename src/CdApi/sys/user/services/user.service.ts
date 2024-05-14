
import { createConnection, getConnection } from 'typeorm';
import 'reflect-metadata';
// import { defer, from, interval, Observable, of, mergeMap, pipe, combineLatest } from 'rxjs';
import * as Rx from 'rxjs';
import { map, tap, pluck, reduce, filter, take } from 'rxjs/operators';
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
// import * as objectsToCsv from 'objects-to-csv';
import * as Lá from 'lodash';
import * as R from 'ramda';
import objectsToCsv from '../../base/objectsToCsv';
import { configure, getLogger, Appender } from 'log4js';
import { BaseService } from '../../base/base.service';
import { UserModel } from '../models/user.model';
import { registerNotifTemplate } from '../models/registerNotifTemplate';
import { CdService } from '../../base/cd.service';
import { MailService } from '../../comm/services/mail.service';
import userConfig from '../userConfig';
import { Database } from '../../base/connect';
import * as bcrypt from 'bcrypt';
import { DocModel } from '../../moduleman/models/doc.model';
import { IServiceInput, Fn, IRespInfo, CreateIParams, IQuery } from '../../base/IBase';
import { SessionService } from './session.service';
import { SessionModel } from '../models/session.model';
import { ISessResp } from '../../base/IBase';
import { ModuleService } from '../../moduleman/services/module.service';
import { ConsumerService } from '../../moduleman/services/consumer.service';
import { UserViewModel } from '../models/user-view.model';
import { GroupService } from './group.service';
import { GroupModel } from '../models/group.model';
import { Logging } from '../../base/winston.log';



export class UserService extends CdService {
    logger: Logging;
    cdToken: string;
    b: BaseService;
    userModel;
    mail: MailService;
    db;
    srvSess: SessionService;
    srvModules: ModuleService;
    svConsumer: ConsumerService;
    requestPswd: string;
    plData:any;

    // i: IRespInfo = {
    //     messages: null,
    //     code: '',
    //     app_msg: ''
    // };

    loginState = false;

    /*
     * create rules
     */
    cRules: any = {
        required: [
            'userName',
            'email',
            'password',
        ],
        noDuplicate: [
            'userName',
            'email'
        ],
    };

    constructor() {
        super();
        this.logger = new Logging();
        this.b = new BaseService();
        this.mail = new MailService();
        this.userModel = new UserModel();
        this.srvSess = new SessionService();
        this.srvModules = new ModuleService();
        this.svConsumer = new ConsumerService();
    }

    // async init() {
    //     if (!this.db) {
    //         const db = await new Database();
    //         await db.setConnEntity(UserModel);
    //         await db.setConnEntity(DocModel);
    //         await db.getConnection();
    //     }
    // }

    async create(req, res): Promise<void> {
        if (await this.validateCreate(req, res)) {
            const user = new UserModel();
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: UserModel,
                serviceModelInstance: user,
                docName: 'Register User',
                dSource: 1,
            }
            const newUser: UserModel = await this.b.create(req, res, serviceInput);
            this.logger.logInfo('UserService::create()/newUser:', newUser)
            const plData = this.b.getPlData(req);
            this.logger.logInfo('UserService::create()/plData:', plData)
            this.afterCreate(req, res, newUser)
            this.b.cdResp.data = await newUser;
            this.b.cdResp.app_state.success = true;
            const r = await this.b.respond(req, res);
        } else {
            const i = {
                messages: this.b.err,
                code: 'UserService:create',
                app_msg: ''
            };
            await this.b.setAppState(false, i, null);
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<UserModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async beforeCreate(req, res) {
        this.b.setPlData(req, { key: 'userGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'activationKey', value: this.b.getGuid() });
        this.userModel.user_guid = this.b.getGuid();
        this.userModel.activation_key = this.b.getGuid();
        await this.cryptPassword(req);
    }

    async afterCreate(req, res, userData: UserModel) {
        const sessData: SessionModel = await this.authI(req, res)
        this.b.sess = [sessData];
        this.logger.logInfo('UserService::afterCreate()/sessData:', sessData)
        // update req with token
        req.post.dat.token = sessData.cdToken
        const svGroup = new GroupService()
        svGroup.b = this.b
        // every user must have 'pals' group after registration
        const palGroup = await svGroup.createPalsGroup(req, res, userData)
        this.logger.logInfo('UserService::afterCreate()/palGroup:', {palGroup: palGroup})
        this.regisrationNotification(req, res);
    }

    async validateCreate(req, res) {
        this.logger.logInfo('UserService::validateCreate()/01')
        const svConsumer = new ConsumerService()
        const params = {
            controllerInstance: this,
            model: UserModel,
        }
        this.plData = this.b.getPlData(req);
        if (await this.b.validateUnique(req, res, params)) {
            this.logger.logInfo('UserService::validateCreate()/01')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                this.logger.logInfo('UserService::validateCreate()/02')
                if (!svConsumer.getConsumerGuid(req)) {
                    this.logger.logInfo('UserService::validateCreate()/03')
                    this.b.err.push('valid consumer token is missing in the auth request');
                    return false;
                } else {
                    this.logger.logInfo('UserService::validateCreate()/04')
                    const plData = await this.b.getPlData(req)
                    if (await this.svConsumer.consumerGuidIsValid(req, res, plData.consumerGuid) === false) {
                        this.logger.logInfo('UserService::validateCreate()/05')
                        this.b.err.push('consumer token is not valid');
                        return false;
                    }
                    this.logger.logInfo('UserService::validateCreate()/06')
                }
                this.logger.logInfo('UserService::validateCreate()/07')
                return true;
            } else {
                this.b.err.push(`you must provide ${JSON.stringify(this.cRules.required)}`);
                return false;
            }
        } else {
            this.b.err.push(`duplication of ${JSON.stringify(this.cRules.noDuplicate)} not allowed`);
            return false;
        }
    }

    async cryptPassword(req) {
        const d = await this.b.getPlData(req);
        this.requestPswd = this.plData.password
        this.plData.password = await bcrypt.hash(d.password, 10);
    }

    async regisrationNotification(req, res) {
        if (userConfig.register.notification.email) {
            this.plData.msg = registerNotifTemplate(await this.userModel);
            const mailRet = await this.mail.sendEmailNotif(await req, res);
        }
    }

    async createMulti(req, res): Promise<void> {
        createConnection().then(async connection => {
            const d = this.plData;
            const regResp = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(UserModel)
                .values(
                    d
                    // [
                    //     { fname: 'Timber', lname: 'Saw', password: 'secret', email: 'eee', username: 'tisaw' },
                    //     { fname: 'Phantom', lname: 'Lancer', password: 'admin', email: 'fff', username: 'phalance' }
                    // ]
                )
                .execute();
            getConnection().close();
            const r = await this.b.respond(req, res);
        }).catch(async (error) => {
            getConnection().close();
            this.logger.logInfo(`Error: ${error}`);
            // return error;
            await this.b.respond(req, res);
        });
    }

    async createDoc(req, res, savedUser) {
        const doc = new DocModel();
        const userRepository = await getConnection().getRepository(UserModel);
        doc.docName = 'Register User';
        return await userRepository.save(await this.b.getPlData(req));
    }

    getUserActiveCo() {
        return {};
    }

    getContacts(cuid) {
        return [{}];
    }

    /**
     * Use BaseService for simple search
     * @param req
     * @param res
     */
    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        return await this.b.read(req, res, serviceInput);
    }

    update(req, res) {
        // this.logger.logInfo('UserService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: UserModel,
            docName: 'UserService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // this.logger.logInfo('UserService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.userEnabled === '') {
            q.update.userEnabled = null;
        }
        return q;
    }

    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "UpdatePassword",
            "dat": {
                "f_vals": [
                    {
                        "forgotPassword": true, // optional: used securely when oldPassword is not avialble (developer option...NOT end user) 
                        "oldPassword": null, // can be set to oldPassword text or set to null by develper to use in case of forgotPassword === true;
                        "query": {
                            "update": {
                                "password": "iiii"
                            },
                            "where": {
                                "userId": 1003
                            }
                        }
                    }
                ],
                "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
            },
            "args": {}
        }
     * @param req 
     * @param res 
     */
    async updatePassword(req, res) {
        // this.logger.logInfo('UserService::update()/01');
        await this.beforeUpdatePassword(req, res, this.b.getQuery(req));
        const serviceInput = {
            serviceModel: UserModel,
            docName: 'UserService::update',
            cmd: {
                action: 'update',
                query: this.b.getQuery(req)
            },
            dSource: 1
        }
        this.logger.logInfo('UserService::update()/02')
        this.logger.logInfo('UserService::update()/serviceInput:', serviceInput)
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })

    }

    async beforeUpdatePassword(req, res, q: IQuery) {
        this.plData = this.b.getPlData(req)
        // 1. get cUser
        this.logger.logInfo('UserService::beforeUpdatePassword()/f:', q);
        this.requestPswd = req.post.dat.f_vals[0].oldPassword;
        this.logger.logInfo('UserService::beforeUpdatePassword()/this.requestPswd:', {requestPswd:this.requestPswd});
        // 1. confirm old password
        const qExists = { where: { userId: q.where.userId } };
        const cUser = await this.getUserI(req, res, qExists)
        this.logger.logInfo('UserService::beforeUpdatePassword()/cUser:', cUser);
        if (cUser.length > 0) {
            if (await this.verifyPassword(req, res, cUser)) {
                // old password is valid
                this.logger.logInfo('UserService::beforeUpdatePassword()/req.post.dat.f_vals[0].update.password 1:', req.post.dat.f_vals[0].query.update.password);
                // 2. bicrypt the new password
                req.post.dat.f_vals[0].query.update.password = await bcrypt.hash(req.post.dat.f_vals[0].query.update.password, 10);
                this.logger.logInfo('UserService::beforeUpdatePassword()/req.post.dat.f_vals[0].update.password 2:', req.post.dat.f_vals[0].query.update.password);
            } else {
                const i = {
                    messages: this.b.err,
                    code: 'UserService:beforeUpdatePassword',
                    app_msg: 'incorrect old-password'
                };
                await this.b.setAppState(false, i, null);
                const r = await this.b.respond(req, res);
            }
            // return q;
        } else {
            const i = {
                messages: this.b.err,
                code: 'UserService:beforeUpdatePassword',
                app_msg: 'user not found'
            };
            await this.b.setAppState(false, i, null);
            const r = await this.b.respond(req, res);
        }

    }

    // async getUserI(req, res, q: IQuery): Promise<UserModel[]> {
    //     const serviceInput: IServiceInput = {
    //         serviceModel: UserModel,
    //         docName: 'UserService::getUser$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     return await this.read(req, res, serviceInput)
    // }

    async getUserI(req, res, q: IQuery = null): Promise<UserModel[]> {
        if (q == null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('UserService::getUserI/f:', q);
        const serviceInput = {
            serviceModel: UserModel,
            docName: 'UserService::getUserI',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            return this.b.read(req, res, serviceInput)
        } catch (e) {
            this.logger.logInfo('UserService::getUserI()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'UserService:getUserI',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }


    remove(req, res): Promise<void> {
        this.logger.logInfo(`starting SessionService::remove()`);
        return null;
    }

    rbCreate(): number {
        return 1;
    }

    rbUpdate(): number {
        return 1;
    }

    rbRemove(): number {
        return 1;
    }

    async auth(req, res) {
        this.logger.logInfo('UserService::auth()/01');
        const svSess = new SessionService();
        this.logger.logInfo('auth()/UserModel:', {userModel: JSON.stringify(UserModel)});
        this.logger.logInfo('auth()/req.post:', {dat: JSON.stringify(req.post.dat)});
        this.plData = this.b.getPlData(req);
        const q: IQuery = {
            // get requested user and 'anon' data/ anon data is used in case of failure
            where: [
                { userName: this.plData.userName },
                { userName: 'anon' }
            ]
        };
        const serviceInput: IServiceInput = {
            serviceModel: UserModel,
            modelName: "UserModel",
            docName: 'UserService::get',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        const result: UserModel[] = await this.b.get(req, res, serviceInput, q);
        this.logger.logInfo('UserService::auth()/result:', result);
        const guest = await this.resolveGuest(req, res, result);
        this.logger.logInfo('UserService::auth()/guest:', guest)
        try {
            this.logger.logInfo('UserService::auth()/02');
            await this.authResponse(req, res, guest);
        } catch (e) {
            this.logger.logInfo('UserService::auth()/03');
            this.b.i.app_msg = `oops! there was an error fetching response`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
            this.b.respond(req, res)
        }
    }

    async resolveGuest(req, res, guestArr: UserModel[]): Promise<UserModel> {
        this.logger.logInfo('UserService::resolveGuest()/01');
        const plData = this.b.getPlData(req);
        this.logger.logInfo('UserService::resolveGuest()/plData:', plData)
        // this.logger.logInfo('UserService::resolveGuest()/guestArr:', guestArr)
        if (guestArr.length > 0) {
            this.logger.logInfo('UserService::resolveGuest()/02');
            // search if given username exists
            this.logger.logInfo('UserService::resolveGuest()/this.plData:', this.plData)
            let cUser: UserModel[] = guestArr.filter((u) => u.userName === this.plData.userName)
            this.logger.logInfo('UserService::resolveGuest()/cUser:', cUser)
            if (cUser.length > 0) {
                this.logger.logInfo('UserService::resolveGuest()/03');
                this.requestPswd = this.plData.password
                // if exists, check password
                // ...check password
                if (await this.verifyPassword(req, res, cUser)) {
                    this.logger.logInfo('UserService::resolveGuest()/031');
                    // if password is ok, return user data
                    this.loginState = true;
                    this.b.i.app_msg = `Welcome ${cUser[0].userName}!`;
                    return cUser[0];
                } else {
                    this.logger.logInfo('UserService::resolveGuest()/040');
                    // else if password is invialid, select anon user and return
                    this.b.i.app_msg = 'Login failed!';
                    cUser = guestArr.filter((u) => u.userName === 'anon')
                    return cUser[0];
                }
            }
            else {
                this.logger.logInfo('UserService::resolveGuest()/04');
                // else if user name does not exists, seach for anon user and return
                this.b.i.app_msg = 'Login failed!';
                cUser = guestArr.filter((u) => u.userName === 'anon')
                return cUser[0];
            }
        }
    }

    async verifyPassword(req, res, cUser: UserModel[]) {
        this.logger.logInfo('UserService::verifyPassword()/01')
        // const plData = await this.b.getPlData(req);
        // this.logger.logInfo('UserService::verifyPassword()/plData:', plData)
        this.logger.logInfo('UserService::verifyPassword()/cUser:', cUser)
        // this.logger.logInfo('UserService::verifyPassword()/plData.password:', plData.password)
        this.logger.logInfo('UserService::verifyPassword()/cUser.password:', {pswd:cUser[0].password})
        this.logger.logInfo('UserService::verifyPassword()/this.requestPswd:', {requestPswd:this.requestPswd})
        let validPassword: any = null;
        if(req.post.dat.f_vals[0].forgotPassword){
            // overide verification in circumstances where password is forgotten
            validPassword = true;
        } else {
            validPassword = await bcrypt.compare(this.requestPswd, cUser[0].password);
        }
        
        this.logger.logInfo('UserService::verifyPassword()/02')
        this.logger.logInfo('UserService::verifyPassword()/validPassword:', validPassword)
        if (validPassword) {
            this.logger.logInfo('UserService::verifyPassword()/03')
            return true;
        } else {
            this.logger.logInfo('UserService::verifyPassword()/04')
            return false;
        }
    }

    /**
     * Auth internal
     * used when not relying on request data but internal process
     * @param req 
     * @param res 
     */
    async authI(req, res): Promise<SessionModel> {
        // const svSess = new SessionService();
        this.logger.logInfo('auth()/req.post:', {dat:req.post.dat});
        const q: IQuery = {
            // get requested user and 'anon' data/ anon data is used in case of failure
            where: [
                { userName: this.plData.userName },
                { userName: 'anon' }
            ]
        };
        const serviceInput: IServiceInput = {
            serviceModel: UserModel,
            modelName: "UserModel",
            docName: 'UserService::get',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        const result: UserModel[] = await this.b.get(req, res, serviceInput, q);
        const guest = await this.resolveGuest(req, res, result);
        this.logger.logInfo('UserService::auth1()/guest:', guest)
        return await this.srvSess.create(req, res, guest)
    }

    async authResponse(req, res, guest) {
        this.logger.logInfo('UserService::authResponse()/01');
        this.b.logTimeStamp('UserService::authResponse/01')
        // this.logger.logInfo('UserService::authResponse/01:');
        this.processResponse$(req, res, guest)
            .subscribe(
                (ret: any) => {
                    this.logger.logInfo('UserService::authResponse()/02');
                    this.b.logTimeStamp('ModuleService::authResponse/02/ret:')
                    this.logger.logInfo('UserService::authResponse()/02/ret:', ret);
                    // const i = null;
                    const sessData: ISessResp = {
                        cd_token: ret.sessResult.cdToken,
                        userId: ret.modulesUserData.userData.userId,
                        jwt: null,
                        ttl: ret.sessResult.ttl
                    };
                    if (ret.modulesUserData.menuData.length > 0) {
                        this.logger.logInfo('UserService::authResponse()/03');
                        ret.modulesUserData.menuData = ret.modulesUserData.menuData.filter(menu => menu !== null);
                    } else {
                        this.logger.logInfo('UserService::authResponse()/04');
                        this.b.i.app_msg = `Sorry, you must be a member of this company to access any resources`;
                        this.loginState = false;
                        ret.modulesUserData.menuData = [];
                    }
                    this.logger.logInfo('UserService::authResponse()/05');
                    this.b.i.messages = this.b.err;
                    this.b.setAppState(this.loginState, this.b.i, sessData);
                    this.b.cdResp.data = ret.modulesUserData;
                    this.b.respond(req, res)
                }
            );
    }

    processResponse$(req, res, guest) {
        this.b.logTimeStamp('UserService::processResponse$/01')
        delete guest.password;
        const sessResult$: Rx.Observable<SessionModel> = Rx.from(this.srvSess.create(req, res, guest));
        const modulesUserData$ = this.srvModules.getModulesUserData$(req, res, guest);
        const sessFlat = r => { return r };
        this.b.logTimeStamp('ModuleService::processResponse$/02')
        return Rx.forkJoin({
            sessResult: sessResult$,
            modulesUserData: modulesUserData$
        })
            .pipe(
                Rx.defaultIfEmpty({
                    sessResult: sessResult$.pipe(Rx.mergeMap(r => sessFlat(r))),
                    modulesUserData: {
                        consumer: [],
                        menuData: [],
                        userData: {}
                    }
                })
            )
    }

    async getUserByID(req, res, uid): Promise<UserModel[]> {
        const serviceInput = {
            serviceInstance: this,
            serviceModel: UserModel,
            docModel: DocModel,
            docName: 'UserService::getUserByID',
            cmd: {
                action: 'find',
                query: { where: { userId: uid } }
            },
            dSource: 1,
        }
        return await this.read(req, res, serviceInput);
    }

    validateLogin(req) {
        let isValid = true;
        if (!this.plData.consumer_guid) {
            isValid = false;
        }

        if (!this.plData.consumer_guid) {
            this.b.err.push('consumerGuid is missing or invalid');
            isValid = false;
        }
        return isValid;
    }

    async getUser(req, res, q: IQuery = null) {
        if (q == null) {
            q = this.b.getQuery(req);
        }
        this.logger.logInfo('UserService::getUser/f:', q);
        const serviceInput = {
            serviceModel: UserModel,
            docName: 'UserService::getUser$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    this.logger.logInfo('UserService::read$()/r:', r)
                    this.b.i.code = 'UserController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            this.logger.logInfo('UserService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    getUserCount(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('UserService::getUserCount/q:', q);
        const serviceInput = {
            serviceModel: UserViewModel,
            docName: 'UserService::getUserCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'UserController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    // getUserTypeCount(req, res) {
    //     const q = this.b.getQuery(req);
    //     this.logger.logInfo('UserService::getUserCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: UserTypeModel,
    //         docName: 'UserService::getUserCount$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     this.b.readCount$(req, res, serviceInput)
    //         .subscribe((r) => {
    //             this.b.i.code = 'UserController::Get';
    //             const svSess = new SessionService();
    //             svSess.sessResp.cd_token = req.post.dat.token;
    //             svSess.sessResp.ttl = svSess.getTtl();
    //             this.b.setAppState(true, this.b.i, svSess.sessResp);
    //             this.b.cdResp.data = r;
    //             this.b.respond(req, res)
    //         })
    // }

    delete(req, res) {
        const q = this.b.getQuery(req);
        this.logger.logInfo('UserService::delete()/q:', q)
        const serviceInput = {
            serviceModel: UserModel,
            docName: 'UserService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * get anon user data
     */
    async getAnon(req, res) {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: UserModel,
            docName: 'UserService::getAnon',
            cmd: {
                action: 'count',
                query: { where: { userName: 'anon' } }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput);
    }



}