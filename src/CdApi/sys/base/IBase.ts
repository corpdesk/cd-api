// export interface Type<T> extends Function {
//     new (...args: any[]): T;
// }
export type ClassRef = new (...args: any[]) => any;

export interface IUser{
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

export interface ModelRules{
    create: object;
    update: object;
    remove: object;
}

export interface IController {
    b: any; // instance of BaseController
    // cdToken: string;
    // cRules: object;
    // uRules: object;
    // dRules: object;
    modelRules: ModelRules;
}

// cd request format
export interface CdRequest {
    ctx: string;
    m: string;
    c: string;
    a: string;
    dat: object;
    args: object;
}

// cd response format
export interface CdResponse {
    app_state: {
        success: number;
        info: {
            messages: string;
            code: number;
            app_msg: any;
        };
        sess: {
            cd_token: string;
            jwt: string;
            p_sid: string;
            ttl: number;
        };
        cache: object;
    };
    data: object;
}