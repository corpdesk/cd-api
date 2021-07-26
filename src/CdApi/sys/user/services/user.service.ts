
import { createConnection, getConnection, } from 'typeorm';
import 'reflect-metadata';
import { BaseService } from '../../base/base.service';
import { ICdPushEnvelop, ICdResponse, ICommConversationSub } from '../../base/IBase';
import { User } from '../models/user.model';
import { registerNotifTemplate } from '../models/registerNotifTemplate';
import { CdPushController } from '../../cd-push/controllers/cdpush.controller';
import { CdService } from '../../base/cd.service';

export class UserService extends CdService {
    cdToken: string;
    b: BaseService;

    constructor() {
        super();
        console.log('starting UserController::constructor()');
        this.b = new BaseService();
    }

    async create(req, res): Promise<void> {
        console.log(`starting SessionService::create()`);
        createConnection().then(async connection => {

            console.log('Inserting a new user into the database...');
            const user = new User();
            const d = req.post.dat.f_vals[0].data;
            // user.fname = d.fname;
            // user.lname = d.lname;
            // user.password = d.password;
            // user.email = d.email;
            // user.username = d.username;
            // console.log('email: ' + JSON.stringify(d.email));

            for (const key in d) {
                if (key) {
                    user[key] = d[key];
                }
            }
            const regResp = await connection.manager.save(user);
            console.log('Saved a new user with id: ' + user.user_id);
            req.post.dat.f_vals[0].data.msg = registerNotifTemplate(await user);
            const mailRet = await this.sendEmailNotif(await req, res);
            console.log(`Register/regResp: ${JSON.stringify(regResp)}`);
            this.b.cdResp.data = await regResp;
            console.log(`Register/this.b.cdResp.data: ${JSON.stringify(this.b.cdResp.data)}`);
            const pRecepients: ICommConversationSub[] = [
                {
                    user_id: user.user_id,
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

            /////////////////////////////////////

            // console.log('Loading users from the database...');
            // const users = await connection.manager.find(User);
            // console.log('Loaded users: ', users);

            // console.log('Here you can setup and run express/koa/any other framework.');


            // const ret = await getConnection()
            //     .createQueryBuilder()
            //     .insert()
            //     .into(User)
            //     .values([
            //         { fname: 'Timber', lname: 'Saw', password: 'secret', email: 'eee', username: 'tisaw' },
            //         { fname: 'Phantom', lname: 'Lancer', password: 'admin', email: 'fff', username: 'phalance' }
            //     ])
            //     .execute();
            getConnection().close();
            console.log('ret', regResp);
            const r = await this.b.respond(req, res, regResp);
            // return ret;
        }).catch(async (error) => {
            getConnection().close();
            console.log(`Error: ${error}`);
            // return error;
            await this.b.respond(req, res, error);
        });
    }

    read(req, res): Promise<void> {
        console.log(`starting SessionService::read()`);
        return null;
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

    async Register(req, res) {
        createConnection().then(async connection => {

            console.log('Inserting a new user into the database...');
            const user = new User();
            const d = req.post.dat.f_vals[0].data;
            user.fname = d.fname;
            user.lname = d.lname;
            user.password = d.password;
            user.email = d.email;
            user.username = d.username;
            console.log('email: ' + JSON.stringify(d.email));
            const regResp = await connection.manager.save(user);
            console.log('Saved a new user with id: ' + user.user_id);
            req.post.dat.f_vals[0].data.msg = registerNotifTemplate(await user);
            const mailRet = await this.sendEmailNotif(await req, res);
            console.log(`Register/regResp: ${JSON.stringify(regResp)}`);
            this.b.cdResp.data = await regResp;
            console.log(`Register/this.b.cdResp.data: ${JSON.stringify(this.b.cdResp.data)}`);
            const pRecepients: ICommConversationSub[] = [
                {
                    user_id: user.user_id,
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

            /////////////////////////////////////

            // console.log('Loading users from the database...');
            // const users = await connection.manager.find(User);
            // console.log('Loaded users: ', users);

            // console.log('Here you can setup and run express/koa/any other framework.');


            // const ret = await getConnection()
            //     .createQueryBuilder()
            //     .insert()
            //     .into(User)
            //     .values([
            //         { fname: 'Timber', lname: 'Saw', password: 'secret', email: 'eee', username: 'tisaw' },
            //         { fname: 'Phantom', lname: 'Lancer', password: 'admin', email: 'fff', username: 'phalance' }
            //     ])
            //     .execute();
            getConnection().close();
            console.log('ret', regResp);
            const r = await this.b.respond(req, res, regResp);
            // return ret;
        }).catch(async (error) => {
            getConnection().close();
            console.log(`Error: ${error}`);
            // return error;
            await this.b.respond(req, res, error);
        });
    }

    async sendEmailNotif(req, res) {
        console.log(`starting UserController::sendEmailNotif(req, res)`);
        const mailService = 'NodemailerService';
        const cPath = `../comm/services/${mailService.toLowerCase()}`; // relative to BaseService because it is called from there
        const clsCtx = {
            path: cPath,
            clsName: mailService,
            action: 'sendMail'
        }
        console.log(`clsCtx: ${JSON.stringify(clsCtx)}`);
        const ret = await this.b.resolveCls(req, res, clsCtx);
    }
}