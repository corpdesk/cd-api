
/**
 * @path // the path of the controller relative to the BaseService file
 * @clsName // class name
 * @action // class method to invoke
 */
 export interface IControllerContext {
    path: string;
    clsName: string;
    action: string;
}

export interface IModelRules {
    create: object;
    update: object;
    remove: object;
}

// cd request format
export interface ICdRequest {
    ctx: string;
    m: string;
    c: string;
    a: string;
    dat: any;
    args: object;
}

export interface ICdResponse {
    app_state: {
        success: boolean;
        info: IRespInfo;
        sess: ISessResp;
        cache: object;
    };
    data: object;
}

export interface ISessResp{
    cd_token: string;
    jwt: string;
    p_sid: string;
    ttl: number;
}

export interface IRespInfo{
    messages: string[];
    code: string;
    app_msg: any;
}

export interface ICdPushEnvelop {
    pushRecepients: any;
    triggerEvent: string;
    emittEvent: string;
    req: ICdRequest;
    resp: ICdResponse;
    pushData?: any;
}

export type ClassRef = new (...args: any[]) => any;

export interface IUser {
    userID: number;
    userGUID: string;
    userName: string;
}
export interface IBase {
    cdToken: string;
    cRules: object;
    uRules: object;
    dRules: object;
}

export interface ICommConversationSub {
    user_id: number; // subscriber user_id
    sub_type_id: number; // type of subscriber
    commconversation_id?: number;
    commconversationsub_id?: number;
    commconversationsub_invited?: boolean;
    commconversationsub_accepted?: boolean;
}



