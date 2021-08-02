
import { createConnection, getConnection } from 'typeorm';
import 'reflect-metadata';
import { BaseService } from '../../base/base.service';
import { UserModel } from '../models/user.model';
import { registerNotifTemplate } from '../models/registerNotifTemplate';
import { CdService } from '../../base/cd.service';
import { MailService } from '../../comm/services/mail.service';
import userConfig from '../userConfig';
import { Database } from '../../base/connect';
import * as bcrypt from 'bcrypt';
import { DocModel } from '../../moduleman/models/doc.model';
import { IServiceInput } from '../../base/IBase';

export class UserService extends CdService {
    cdToken: string;
    b: BaseService;
    userModel;
    mail: MailService;
    db;
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
    }

    async init() {
        if (!this.db) {
            const db = await new Database();
            await db.setConnEntity(UserModel);
            await db.setConnEntity(DocModel);
            await db.getConnection();
        }
    }

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
            const r = await this.b.respond(req, res, regResp);
        } else {
            const i = {
                messages: this.b.err,
                code: 'UserService:create',
                app_msg: ''
            };
            await this.b.setAppState(false, i, null);
            this.b.cdResp.data = [];
            const r = await this.b.respond(req, res, this.b.cdResp.data);
        }
    }

    async validateCreate(req, res) {
        await this.init();
        const params = {
            controllerInstance: this,
            model: UserModel,
        }
        if (await this.b.validateUnique(req, res, params)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                return true;
            } else {
                this.b.err.push('you must provide username, password and email');
                return false;
            }
        } else {
            this.b.err.push('duplication of email and user name not allowed');
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
            const r = await this.b.respond(req, res, regResp);
        }).catch(async (error) => {
            getConnection().close();
            console.log(`Error: ${error}`);
            // return error;
            await this.b.respond(req, res, error);
        });
    }

    async createDoc(req, res, savedUser) {
        const doc = new DocModel();
        const userRepository = await getConnection().getRepository(UserModel);
        doc.docName = 'Register User';
        return await userRepository.save(this.b.getPlData(req));
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
}