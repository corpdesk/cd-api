
import config from "../../../../config";
import { BaseService } from "../../base/base.service";
import { NodemailerService } from "./nodemailerservice";
import { ZeptoMailService } from "./zeptomai.service";

export class MailService {
  b: BaseService;
  constructor() {
    this.b = new BaseService();
  }

  async sendEmailNotif(req, res, msg, recepientUser) {
    console.log(`starting UserController::sendEmailNotif(req, res)`);
    let ret;
    switch (await this.getMailInterface()) {
      case "nodemailer":
        const nm = new NodemailerService();
        ret = await nm.sendMail(req, res, msg, recepientUser);
        break;
      case "zeptomail":
        const zm = new ZeptoMailService();
        ret = await zm.sendMail(req, res, msg, recepientUser);
        break;
    }
    return ret;
  }

  async getMailInterface(): Promise<string> {
    const activeInterface = config.emailInterface.find((service) => service.active);
    return activeInterface ? activeInterface.name : "nodemailer"; // Default to nodemailer if none is active
  }
  
}
