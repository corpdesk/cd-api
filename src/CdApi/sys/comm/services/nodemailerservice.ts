// /**
//  *
//  * Supported services
//     Service names are case insensitive

//         '126'
//         '163'
//         '1und1'
//         'AOL'
//         'DebugMail'
//         'DynectEmail'
//         'FastMail'
//         'GandiMail'
//         'Gmail'
//         'Godaddy'
//         'GodaddyAsia'
//         'GodaddyEurope'
//         'hot.ee'
//         'Hotmail'
//         'iCloud'
//         'mail.ee'
//         'Mail.ru'
//         'Maildev'
//         'Mailgun'
//         'Mailjet'
//         'Mailosaur'
//         'Mandrill'
//         'Naver'
//         'OpenMailBox'
//         'Outlook365'
//         'Postmark'
//         'QQ'
//         'QQex'
//         'SendCloud'
//         'SendGrid'
//         'SendinBlue'
//         'SendPulse'
//         'SES'
//         'SES-US-EAST-1'
//         'SES-US-WEST-2'
//         'SES-EU-WEST-1'
//         'Sparkpost'
//         'Yahoo'
//         'Yandex'
//         'Zoho'
//         'qiye.aliyun'
//  */
import 'reflect-metadata';
import { createConnection, getConnection, } from 'typeorm';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { BaseController } from '../../base/base.controller';
import { CdPushController } from '../../cd-push/controllers/cdpush.controller';
import { mailConfig } from '../../../../config';
import { Comm } from '../models/comm.model';

export class NodemailerService {
    b: BaseController;
    cdPush: CdPushController;
    constructor() {
        // console.log('starting NodemailerController::constructor()');
        this.b = new BaseController();
        this.cdPush = new CdPushController();

    }


    /**
     * Also see Optional method following this method
     * Refer to supported services at the top of this file
     * @param req
     * @param res
     */
    async sendMail(req, res) {
        const transporter = nodemailer.createTransport({
            service: 'Zoho', // no need to set host or port etc. See alternative at top of file.
            auth: {
                user: 'corpdesk@zohomail.com',
                pass: 'Mw6udKgffR43S8a'
            }
        });

        const mail = {
            from: `'CD Platform' <corpdesk@zohomail.com>`,
            to: 'george.oremo@gmail.com',
            subject: 'Testing with Zoho',
            text: 'Hello world?',
            html: '<strong>This is test with ret?</strong>',
            headers: { 'x-myheader': 'test header' }
        }

        return await transporter.sendMail(mail, (err, info) => {
            console.log(err);
            console.log(info.envelope);
            console.log(info.messageId);
        });
    }

    /**
     * Optional method
     * @param req
     * @param res
     */
     async sendMail2(req, res) {
        const username = 'corpdesk@zohomail.com';
        const password = 'Mw6udKgffR43S8a';

        const transporter = nodemailer.createTransport(mailConfig(username, password));
        const data = {
            t: transporter,
            mail: {
                from: `'Test' <corpdesk@zohomail.com>`,
                to: 'george.oremo@gmail.com',
                subject: 'Hello from node',
                text: 'Hello world?',
                html: '<strong>Hello world?</strong>',
                headers: { 'x-myheader': 'test header' }
            }
        }
        this.exec(req, res, data);
    }

    async ArchiveMail(req, res) {
        createConnection().then(async connection => {
            console.log('Inserting a new user into the database...');
            const comm = new Comm();
            comm.comm_name = 'Timber';
            const ret = await connection.manager.save(comm);
            getConnection().close();
            console.log('ret', ret);
            const r = await this.b.respond(req, res, ret);
            // return ret;
        }).catch(async (error) => {
            getConnection().close();
            console.log(`Error: ${error}`);
            // return error;
            // await this.b.respond(req, res, error);
            // Notification.dispatch();
        });
    }

    async exec(req, res, data) {
        // send mail with defined transport object
        const ret = await data.t.sendMail(data.mail, (err, info) => {
            console.log(err);
            console.log(info.envelope);
            console.log(info.messageId);
        });

        // console.log('Message sent: %s', ret.response);
        // this.cdPush.emit('mailSent', ret.response);
        // return info.response;
    }

}