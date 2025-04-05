
import config from "../../../../config";
import { BaseService } from "../../base/base.service";
import { safeStringify } from "../../utils/safe-stringify";
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
        console.log(`UserController::sendEmailNotif()/using nodemailer`);
        const nm = new NodemailerService();
        ret = await nm.sendMail(req, res, msg, recepientUser);
        break;
      case "zeptomail":
        console.log(`UserController::sendEmailNotif()/using zeptomail`);
        const zm = new ZeptoMailService();
        ret = await zm.sendMail(req, res, msg, recepientUser);
        break;
    }
    return ret;
  }

  async getMailInterface(): Promise<string> {
    const activeInterface = config.emailInterface.find((service) => service.active);
    console.log(`UserController::getMailInterface()/activeInterface: ${JSON.stringify(activeInterface)}`);
    return activeInterface ? activeInterface.name : "nodemailer"; // Default to nodemailer if none is active
  }
  
}
