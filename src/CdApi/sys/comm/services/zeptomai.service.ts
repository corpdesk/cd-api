// https://www.npmjs.com/package/zeptomail

// For ES6
import { SendMailClient } from "zeptomail";
import { Logging } from "../../base/winston.log";
import { BaseService } from "../../base/base.service";
import { CdPushController } from "../../cd-push/controllers/cdpush.controller";
import { UserModel } from "../../user/models/user.model";
import config from "../../../../config";
import { getEmailByName, stripHTML } from "../models/mail.model";

export class ZeptoMailService {
  logger: Logging;
  b: BaseService;
  cdPush: CdPushController;
  constructor() {
    // console.log('starting NodemailerController::constructor()');
    this.b = new BaseService();
    this.logger = new Logging();
    this.cdPush = new CdPushController();
  }

  async sendMail(req, res, msg, recepientUser: UserModel) {
    const url = "api.zeptomail.com/";
    const token = config.emailApiKeys.zepto;
    let client = new SendMailClient({ url, token });
    const emailPl = {
      from: {
        address: getEmailByName("asdap-admin"),
        name: "asdap-admin",
      },
      to: [
        {
          email_address: {
            address: recepientUser.email,
            name: recepientUser.userName,
          },
        },
      ],
      subject: "Welcome to ASDAP",
      htmlbody: req.post.dat.f_vals[0].data.msg,
    //   text: stripHTML(req.post.dat.f_vals[0].data.msg),
    //   html: req.post.dat.f_vals[0].data.msg,
    };
    client
      .sendMail(emailPl)
      .then((resp) => {
        console.log(`payload: ${JSON.stringify(emailPl)}`);
        console.log(`resp: ${JSON.stringify(resp)}`);
        console.log("success");
      })
      .catch((error) => console.log("error"));
  }
}
