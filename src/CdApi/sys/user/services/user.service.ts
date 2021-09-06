
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
import { IServiceInput, Fn } from '../../base/IBase';
import { SessionService } from './session.service';
import { SessionModel } from '../models/session.model';
import { ISessResp } from '../../base/IBase';
import { ModuleService } from '../../moduleman/services/modules.service';

export class UserService extends CdService {
    cdToken: string;
    b: BaseService;
    userModel;
    mail: MailService;
    db;
    srvSess: SessionService;
    srvModules: ModuleService;

    /*
     * create rules
     */
    cRules = {
        required: [
            'user_name',
            'email',
            'password',
        ],
        noDuplicate: [
            'user_name',
            'email'
        ],
    };

    constructor() {
        super();
        this.b = new BaseService();
        this.mail = new MailService();
        this.userModel = new UserModel();
        this.srvSess = new SessionService();
        this.srvModules = new ModuleService();
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
                serviceModel: UserModel,
                serviceModelInstance: user,
                docModel: DocModel,
                docName: 'Register User',
                dSource: 1,
            }
            const regResp: any = await this.b.create(req, res, serviceInput);
            this.sendEmailNotification(req, res);
            this.b.cdResp = await regResp;
            const r = await this.b.respond(res);
        } else {
            const i = {
                messages: this.b.err,
                code: 'UserService:create',
                app_msg: ''
            };
            await this.b.setAppState(false, i, null);
            const r = await this.b.respond(res);
        }
    }

    async validateCreate(req, res) {
        // await this.init();
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
                    if (!this.consumerGuidIsValid()) {
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
        const d = this.b.getPlData(req);
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
            const r = await this.b.respond(res);
        }).catch(async (error) => {
            getConnection().close();
            console.log(`Error: ${error}`);
            // return error;
            await this.b.respond(res);
        });
    }

    consumerGuidIsValid() {
        return true;
    }

    async createDoc(req, res, savedUser) {
        const doc = new DocModel();
        const userRepository = await getConnection().getRepository(UserModel);
        doc.docName = 'Register User';
        return await userRepository.save(this.b.getPlData(req));
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

    update(req, res): Promise<void> {
        console.log(`starting SessionService::update()`);
        return null;
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
        const serviceInput = {
            serviceModel: UserModel,
            docModel: DocModel,
            docName: 'UserService::Login',
            cmd: {
                action: 'find',
                filter: { where: { userName: req.post.dat.f_vals[0].data.user_name } }
            },
            dSource: 1,
        }
        const result: UserModel[] = await this.read(req, res, serviceInput);
        if (result.length > 0 && this.validateLogin(req)) {
            this.onLoginSuccess(req, res, result);
        } else {
            this.b.serviceErr(res, 'Login failed', 'UserController:Login')
        }
    }

    onLoginSuccess(req, res, result) {
        let loginSuccess = null;
        let i = null;
        const guest: UserModel = result[0];
        loginSuccess = bcrypt.compare(req.post.dat.f_vals[0].data.password, guest.password); // users registered with laravel have isssues...to sort
        loginSuccess = true; // debuging using laravel encrypted passwords;
        this.b.err.push('login success');
        if (loginSuccess) {
            delete guest.password;
            const sessResult$: Rx.Observable<SessionModel> = Rx.from(this.srvSess.create(req, res, guest));
            // sessResult: SessionModel {
            //     startTime: 2021-09-05T05:19:29.000Z,
            //     cdToken: null,
            //     currentUserId: null,
            //     accTime: null,
            //     ttl: null,
            //     active: null,
            //     deviceNetId: null,
            //     consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD',
            //     sessionId: 270
            //   }
            // console.log('sessResult:', sessResult);
            // console.log('UserService::onLoginSuccess(req, res, result)/001');
            const modulesUserData$ = this.srvModules.getModulesUserData$(req, res, guest);
            // console.log('UserService::onLoginSuccess(req, res, result)/002');
            // await Promise.all([sessResult, modulesUserData]);
            // const sessData: ISessResp = {
            //     cd_token: sessResult.cdToken,
            //     jwt: null,
            //     ttl: sessResult.ttl
            // };
            // i = {
            //     messages: this.b.err,
            //     code: 'UserController:Login',
            //     app_msg: ''
            // };
            // console.log('UserService::onLoginSuccess(req, res, result)/003');

            const sessFlat = r => { return r };

            const result$ = Rx.forkJoin({
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
            // console.log('result$:', result$);

            result$
                // .pipe(
                //     Rx.mergeMap((m) => {
                //         return m.modulesUserData.menuData.filter(menu => menu !== null)
                //     })
                // )
                .subscribe(
                    (ret: any) => {
                        // console.log('final ret:', ret);
                        const sessData: ISessResp = {
                            cd_token: ret.sessResult.cdToken,
                            jwt: null,
                            ttl: ret.sessResult.ttl
                        };
                        i = {
                            messages: this.b.err,
                            code: 'UserController:Login',
                            app_msg: 'Login success'
                        };
                        console.log('UserService::onLoginSuccess()/ret:', ret)
                        if (ret.modulesUserData.menuData.length > 0) {
                            ret.modulesUserData.menuData = ret.modulesUserData.menuData.filter(menu => menu !== null);
                        } else {
                            i.app_msg = `Sorry, you must be a member of this company to access any resources`
                            ret.modulesUserData.menuData = [];
                        }

                        // console.log('UserService::onLoginSuccess(req, res, result)/004');
                        this.b.setAppState(true, i, sessData);
                        this.b.cdResp.data = ret.modulesUserData;
                        this.b.respond(res)
                    },
                    err => {
                        console.log('Error', err)
                        this.b.err = err.toString();
                        i = {
                            messages: this.b.err,
                            code: 'UserController:Login',
                            app_msg: ''
                        };
                        this.b.setAppState(false, i, null);
                        this.b.cdResp.data = [];
                        this.b.respond(res)
                    },
                    // () => {
                    //     console.log('request completed.')
                    //     i = {
                    //         messages: this.b.err,
                    //         code: 'UserController:Login',
                    //         app_msg: 'request completed successfully'
                    //     };
                    //     this.b.setAppState(true, i, null);
                    //     this.b.cdResp.data = [];
                    //     this.b.respond(res)
                    // }
                );
        } else {
            // this.b.err.push('login failed');
            i = {
                messages: this.b.err,
                code: 'UserController:Login',
                app_msg: 'Login failed'
            };
            this.b.setAppState(true, i, null);
            this.b.respond(res);
        }
    }

    async getUserByID(req, res, uid): Promise<UserModel[]> {
        const serviceInput = {
            serviceModel: UserModel,
            docModel: DocModel,
            docName: 'UserService::getUserByID',
            cmd: {
                action: 'find',
                filter: { where: { userId: uid } }
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

}