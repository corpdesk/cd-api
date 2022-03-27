import { Observable } from 'rxjs';
import { AclModuleViewModel } from '../moduleman/models/acl-module-view.model';
import { MenuViewModel } from '../moduleman/models/menu-view.model';

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
        sConfig?:IServerConfig;
    };
    data: object;
}

// export interface ISessResp {
//     cd_token?: string;
//     userId?: number | null;
//     jwt?: string;
//     ttl: number;
// }

export interface ISessResp {
    cd_token?: string;
    userId?: number | null;
    jwt: { jwtToken: string, checked: boolean, checkTime:number, authorized: boolean, } | null
    ttl: number;
    initUuid?:string;
    initTime?: string;
}

export interface IRespInfo {
    messages: string[];
    code: string;
    app_msg: any;
}

export interface IServerConfig{
    usePush: boolean;
    usePolling: boolean;
    useCacheStore:boolean;
}

export const DEFAULT_CD_REQUEST: ICdRequest = {
    ctx: 'Sys',
    m: '',
    c: '',
    a: '',
    dat: {
        f_vals: [
            {
                data: {}
            }
        ],
        token: ''
    },
    args: {}
};

export const DEFAULT_CD_RESPONSE: ICdResponse = {
    app_state: {
      success: false,
      info: {
        messages: [],
        code: '',
        app_msg: ''
      },
      sess: {
        cd_token: '',
        jwt: null,
        ttl: 600
      },
      cache: {}
    },
    data: []
  };

export interface ICdPushEnvelop {
    pushRecepients: any;
    triggerEvent: string;
    emittEvent: string;
    req: ICdRequest;
    resp: ICdResponse;
    pushData?: any;
}

export interface IServiceInput {
    serviceInstance?: any;
    serviceModel: any;
    serviceModelInstance?:any;
    docName?: string;
    cmd?:Cmd;
    data?:any;
    dSource?:number;
    extraInfo?: boolean;
}

export interface Cmd{
    action: string;
    query: IQuery;
}

export interface IDoc {
    doc_id?: number;
    doc_guid?: string;
    doc_name?: string;
    doc_description?: string;
    company_id?: number;
    doc_from: number;
    doc_type_id: number;
    doc_date?: Date;
    attach_guid?: string;
    doc_expire_date?: Date;
}

export type ClassRef = new (...args: any[]) => any;
export type Fn = () => void;

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

export interface IAclCtx{
    memberGuid: string;
    moduleGroupGuid: any;
    consumerId: number;
    moduleName: string;
    currentUser: any,
    module: any,
}

export interface ISelectedMenu {
    moduleMenuData?: MenuViewModel[],
    selectedItem: MenuViewModel,
    selectedId?: number,
}

export interface IAllowedModules{
    modules$: Observable<AclModuleViewModel[]>;
    modulesCount: number;
}

export interface IMenuRelations{
    menuParent: MenuViewModel;
    menuChildren: MenuViewModel[];
}

export interface IQuery{
    select?: string [];
    update?: object;
    where: object;
    take?: number;
    skip?: number;
}

export interface ObjectItem{
    key: string,
    value: any
}

export interface CreateIParams{
    serviceInput: IServiceInput;
    controllerData: any;
}

export interface CacheData{
    key: string;
    value: string;
    initUuid?:string;
    initTime?: string;
}






