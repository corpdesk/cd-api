
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



export class UserService extends CdService {
    cdToken: string;
    b: BaseService;
    userModel;
    mail: MailService;
    db;
    srvSess: SessionService;
    srvModules: ModuleService;
    svConsumer: ConsumerService;

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
            'Email',
            'Password',
        ],
        noDuplicate: [
            'userName',
            'Email'
        ],
    };

    constructor() {
        super();
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
            await this.beforCreate(req);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: UserModel,
                serviceModelInstance: user,
                docName: 'Register User',
                dSource: 1,
            }
            const regResp: any = await this.b.create(req, res, serviceInput);
            this.sendEmailNotification(req, res);
            this.b.cdResp = await regResp;
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

    createI(req, res, createIParams: CreateIParams) {
        //
    }

    async beforeCreate(req, res) {
        //
        return true;
    }

    async validateCreate(req, res) {
        const params = {
            controllerInstance: this,
            model: UserModel,
        }
        if (await this.b.validateUnique(req, res, params)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                if (!this.srvSess.getConsumerGuid(req)) {
                    this.b.err.push('consumer guid is missing in the auth request');
                    return false;
                } else {
                    if (!this.svConsumer.consumerGuidIsValid()) {
                        this.b.err.push('consumer guid is not valid');
                        return false;
                    }
                }
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

    async beforCreate(req) {
        this.userModel.user_guid = this.b.getGuid();
        this.userModel.activation_key = this.b.getGuid();
        await this.cryptPassword(req);
    }

    async cryptPassword(req) {
        const d = await this.b.getPlData(req);
        req.post.dat.f_vals[0].data.password = await bcrypt.hash(d.password, 10);
    }

    async sendEmailNotification(req, res) {
        if (userConfig.register.notification.email) {
            req.post.dat.f_vals[0].data.msg = registerNotifTemplate(await this.userModel);
            const mailRet = await this.mail.sendEmailNotif(await req, res);
        }
    }

    async createMulti(req, res): Promise<void> {
        createConnection().then(async connection => {
            const d = req.post.dat.f_vals[0].data;
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
            console.log(`Error: ${error}`);
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
        // console.log('UserService::update()/01');
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
        // console.log('UserService::update()/02')
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

    remove(req, res): Promise<void> {
        console.log(`starting SessionService::remove()`);
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
        console.log('UserService::auth()/01');
        const svSess = new SessionService();
        // const serviceInput = {
        //     serviceInstance: this,
        //     serviceModel: UserModel,
        //     docName: 'UserService::Login',
        //     cmd: {
        //         action: 'find',
        //         query: {
        //             // get requested user and 'anon' data/ anon data is used in case of failure
        //             where: [
        //                 { userName: req.post.dat.f_vals[0].data.user_name },
        //                 { userName: 'anon' }
        //             ]
        //         }
        //     },
        //     dSource: 1,
        // }
        console.log('auth()/req.post:', JSON.stringify(req.post.dat));
        // console.log('auth()/serviceInput:', JSON.stringify(serviceInput));
        // const result: UserModel[] = await this.read(req, res, serviceInput);
        const q: IQuery = {
            // get requested user and 'anon' data/ anon data is used in case of failure
            where: [
                { userName: req.post.dat.f_vals[0].data.userName },
                { userName: 'anon' }
            ]
        };
        const result: UserModel[] = await this.b.get(req, res, UserModel, q);
        const guest = await this.resolveGuest(req, res, result);
        console.log('UserService::auth()/guest:', guest)
        try {
            console.log('UserService::auth()/02');
            await this.authResponse(req, res, guest);
        } catch (e) {
            console.log('UserService::auth()/03');
            this.b.i.app_msg = `oops! there was an error fetching response`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
            this.b.respond(req, res)
        }
    }

    async resolveGuest(req, res, guestArr: UserModel[]): Promise<UserModel> {
        console.log('UserService::resolveGuest()/01');
        // console.log('UserService::resolveGuest()/guestArr:', guestArr)
        if (guestArr.length > 0) {
            console.log('UserService::resolveGuest()/02');
            // search if given username exists
            console.log('UserService::resolveGuest()/req.post.dat.f_vals[0].data:', req.post.dat.f_vals[0].data)
            let user = guestArr.filter((u) => u.userName === req.post.dat.f_vals[0].data.userName)
            // console.log('UserService::resolveGuest()/user:', user)
            if (user.length > 0) {
                console.log('UserService::resolveGuest()/03');
                // if exists, check password
                // ...check password
                // if password is ok, return user data
                this.loginState = true;
                this.b.i.app_msg = `Welcome ${user[0].userName}!`;
                return user[0];
            }
            else {
                console.log('UserService::resolveGuest()/04');
                // else if user name does not exists, seach for anon user and return
                this.b.i.app_msg = 'Login failed!';
                user = guestArr.filter((u) => u.userName === 'anon')
                return user[0];
            }
        }
    }

    async authResponse(req, res, guest) {
        console.log('UserService::authResponse()/01');
        this.b.logTimeStamp('UserService::authResponse/01')
        // console.log('UserService::authResponse/01:');
        this.processResponse$(req, res, guest)
            .subscribe(
                (ret: any) => {
                    console.log('UserService::authResponse()/02');
                    this.b.logTimeStamp('ModuleService::authResponse/02')
                    // const i = null;
                    const sessData: ISessResp = {
                        cd_token: ret.sessResult.cdToken,
                        userId: ret.modulesUserData.userData.userId,
                        jwt: null,
                        ttl: ret.sessResult.ttl
                    };
                    if (ret.modulesUserData.menuData.length > 0) {
                        console.log('UserService::authResponse()/03');
                        ret.modulesUserData.menuData = ret.modulesUserData.menuData.filter(menu => menu !== null);
                    } else {
                        console.log('UserService::authResponse()/04');
                        this.b.i.app_msg = `Sorry, you must be a member of this company to access any resources`;
                        this.loginState = false;
                        ret.modulesUserData.menuData = [];
                    }
                    console.log('UserService::authResponse()/05');
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
        if (!req.post.dat.f_vals[0].data.consumer_guid) {
            isValid = false;
        }

        if (!req.post.dat.f_vals[0].data.consumer_guid) {
            this.b.err.push('consumerGuid is missing or invalid');
            isValid = false;
        }
        return isValid;
    }

    getUser(req, res) {
        const q = this.b.getQuery(req);
        console.log('UserService::getUser/f:', q);
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
                    console.log('UserService::read$()/r:', r)
                    this.b.i.code = 'UserController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('UserService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    getUserCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('UserService::getUserCount/q:', q);
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
    //     console.log('UserService::getUserCount/q:', q);
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
        console.log('UserService::delete()/q:', q)
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

}