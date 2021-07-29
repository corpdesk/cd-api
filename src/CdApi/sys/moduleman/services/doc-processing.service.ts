
import { createConnection, getConnection, } from 'typeorm';
import 'reflect-metadata';
import { BaseService } from '../../base/base.service';
import { ICdPushEnvelop, ICdResponse, ICommConversationSub, IRespInfo } from '../../base/IBase';
import { User } from '../models/user.model';
import { registerNotifTemplate } from '../models/registerNotifTemplate';
import { CdService } from '../../base/cd.service';
import { MailService } from '../../comm/services/mail.service';

export class UserService extends CdService {
    cdToken: string;
    b: BaseService;
    mail: MailService;

    constructor() {
        super();
        this.b = new BaseService();
        this.mail = new MailService();
    }

    async create(req, res): Promise<void> {
        await createConnection().then(async connection => {
            let user = new User();
            // const d = req.post.dat.f_vals[0].data;
            const d = this.b.getPlData(req);
            user = this.b.setEntity(user, d);
            const regResp: any = await connection.manager.save(user);
            req.post.dat.f_vals[0].data.msg = registerNotifTemplate(await user);
            const mailRet = await this.mail.sendEmailNotif(await req, res);
            this.b.cdResp = await regResp;
            const pRecepients: ICommConversationSub[] = [
                {
                    user_id: user.userId,
                    sub_type_id: 1
                }
            ]
            const pushEnvelop: ICdPushEnvelop = {
                pushRecepients: pRecepients,
                emittEvent: 'registered',
                triggerEvent: 'register',
                req: null,
                resp: this.b.cdResp,
                pushData: this.b.cdResp
            };
            getConnection().close();
            console.log('ret', regResp);
            const r = await this.b.respond(req, res, regResp);
        }).catch(async (e) => {
            getConnection().close();
            this.b.err.push(e.toString());
            const i: IRespInfo = {
                messages: this.b.err,
                code: 'UserService:create',
                app_msg: ''
            }
            await this.b.setAppState(false,i,null);
            this.b.respond(req,res,[]);
        });
    }

    async createMulti(req, res): Promise<void> {
        console.log(`starting SessionService::create()`);
        createConnection().then(async connection => {
            const d = req.post.dat.f_vals[0].data;
            const regResp = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values(
                    d
                    // [
                    //     { fname: 'Timber', lname: 'Saw', password: 'secret', email: 'eee', username: 'tisaw' },
                    //     { fname: 'Phantom', lname: 'Lancer', password: 'admin', email: 'fff', username: 'phalance' }
                    // ]
                )
                .execute();
            getConnection().close();
            const r = await this.b.respond(req, res, regResp);
        }).catch(async (error) => {
            getConnection().close();
            console.log(`Error: ${error}`);
            // return error;
            await this.b.respond(req, res, error);
        });
    }

    async read(req, res): Promise<any> {
        console.log(`Starting read(): req.post: ${req.post}`);
        return await createConnection().then(async connection => {
            console.log(`read()/createConnection()`);
            const ret: User[] = await connection.manager.find(User);
            console.log(`ret: ${JSON.stringify(ret)}`);
            getConnection().close();
            // const r = await this.b.respond(req, res, regResp);
            return await ret;
        }).catch(async (e) => {
            getConnection().close();
            console.log(`Error: ${e}`);
            // await this.b.respond(req, res, error);
            return await e;
        });
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

    // setEntity(u: User, d: object){
    //     for (const key in d) {
    //         if (key) {
    //             u[key] = d[key];
    //         }
    //     }
    //     return u;
    // }

    // async Register(req, res) {
    //     createConnection().then(async connection => {

    //         console.log('Inserting a new user into the database...');
    //         const user = new User();
    //         const d = req.post.dat.f_vals[0].data;
    //         user.fname = d.fname;
    //         user.lname = d.lname;
    //         user.password = d.password;
    //         user.email = d.email;
    //         user.username = d.username;
    //         console.log('email: ' + JSON.stringify(d.email));
    //         const regResp = await connection.manager.save(user);
    //         console.log('Saved a new user with id: ' + user.user_id);
    //         req.post.dat.f_vals[0].data.msg = registerNotifTemplate(await user);
    //         const mailRet = await this.sendEmailNotif(await req, res);
    //         console.log(`Register/regResp: ${JSON.stringify(regResp)}`);
    //         this.b.cdResp = await regResp;
    //         console.log(`Register/this.b.cdResp: ${JSON.stringify(this.b.cdResp)}`);
    //         const pRecepients: ICommConversationSub[] = [
    //             {
    //                 user_id: user.user_id,
    //                 sub_type_id: 1
    //             }
    //         ]
    //         const pushEnvelop: ICdPushEnvelop = {
    //             pushRecepients: pRecepients,
    //             emittEvent: 'registered',
    //             triggerEvent: 'register',
    //             req: null,
    //             resp: this.b.cdResp,
    //             pushData: this.b.cdResp
    //         };

    //         /////////////////////////////////////

    //         // console.log('Loading users from the database...');
    //         // const users = await connection.manager.find(User);
    //         // console.log('Loaded users: ', users);

    //         // console.log('Here you can setup and run express/koa/any other framework.');


    //         // const ret = await getConnection()
    //         //     .createQueryBuilder()
    //         //     .insert()
    //         //     .into(User)
    //         //     .values([
    //         //         { fname: 'Timber', lname: 'Saw', password: 'secret', email: 'eee', username: 'tisaw' },
    //         //         { fname: 'Phantom', lname: 'Lancer', password: 'admin', email: 'fff', username: 'phalance' }
    //         //     ])
    //         //     .execute();
    //         getConnection().close();
    //         console.log('ret', regResp);
    //         const r = await this.b.respond(req, res, regResp);
    //         // return ret;
    //     }).catch(async (error) => {
    //         getConnection().close();
    //         console.log(`Error: ${error}`);
    //         // return error;
    //         await this.b.respond(req, res, error);
    //     });
    // }

    // async sendEmailNotif(req, res) {
    //     console.log(`starting UserController::sendEmailNotif(req, res)`);
    //     const mailService = 'NodemailerService';
    //     const cPath = `../comm/services/${mailService.toLowerCase()}`; // relative to BaseService because it is called from there
    //     const clsCtx = {
    //         path: cPath,
    //         clsName: mailService,
    //         action: 'sendMail'
    //     }
    //     console.log(`clsCtx: ${JSON.stringify(clsCtx)}`);
    //     const ret = await this.b.resolveCls(req, res, clsCtx);
    // }
}