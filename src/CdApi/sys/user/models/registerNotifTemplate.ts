
import config from "../../../../config";
import { BaseService } from "../../base/base.service";
import { SessionService } from "../services/session.service";
import { SessionModel } from "./session.model";
import { UserModel } from "./user.model";


export class NotificationTemplate {
    b: BaseService;
    constructor() {
        this.b = new BaseService();
    }

    async registerNotifTemplate(req, res, regUser: UserModel){
        const sessInstance = new SessionService()
        const sess: SessionModel = await sessInstance.create(req, res, regUser)
        const clientContext: any = req.post.dat.f_vals[0].clientContext;
        console.log("registerNotifTemplate()/sess:", JSON.stringify(sess))
        console.log("registerNotifTemplate()/clientContext:", JSON.stringify(clientContext))
        console.log("registerNotifTemplate()/regUser:", JSON.stringify(regUser))
        var ret = await `
        <p>Welcome <b>${regUser.userName}</b>,</p>
        <p>Thank you for regisering with ${clientContext.entity}.</p>
        <p>Follow this  <a href="${config.userActivationUrl}?key=${regUser.activationKey}&sid=${sess.sessionId}&uid=${regUser.userId}">link</a> to activate your account</p>
        <p></p>
        <p>${clientContext.entity} Team</p>
        `;
        console.log("registerNotifTemplate()/ret:", ret)
        return ret;
    }
}