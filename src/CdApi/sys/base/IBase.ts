import { Observable } from 'rxjs';
import { AclModuleViewModel } from '../moduleman/models/acl-module-view.model';
import { MenuViewModel } from '../moduleman/models/menu-view.model';
import { UserModel } from '../user/models/user.model';
import { SessionModel } from '../user/models/session.model';
import { ConsumerModel } from '../moduleman/models/consumer.model';
import { CompanyModel } from '../moduleman/models/company.model';

export const CDOBJ_TYPE_USER = 9
export const CDOBJ_TYPE_GROUP = 10

/**
 * @path // the path of the controller relative to the BaseService file
 * @clsName // class name
 * @action // class method to invoke
 */
export interface IControllerContext {
    path: string;
    clsName: string;
    action: string;
    dataSource: any;
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
    dat: IDat;
    args: object;
}

export interface IDat {
    f_vals: any;
    token: string;
}

export interface ICdResponse {
    app_state: {
        success: boolean;
        info: IRespInfo;
        sess: ISessResp;
        cache: object;
        sConfig?: IServerConfig;
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
    jwt: { jwtToken: string, checked: boolean, checkTime: number, authorized: boolean, } | null
    ttl: number;
    initUuid?: string;
    initTime?: string;
}

export interface ISessionDataExt {
    currentUser: UserModel;
    currentSession: SessionModel;
    currentConsumer: ConsumerModel;
    currentCompany: CompanyModel;
}

export interface IRespInfo {
    messages: string[];
    code: string;
    app_msg: any;
}

export interface IServerConfig {
    usePush: boolean;
    usePolling: boolean;
    useCacheStore: boolean;
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

// export interface ICdPushEnvelop {
//     pushData: {
//         pushGuid: string;
//         m?: string;
//         pushRecepients: ICommConversationSub[];
//         triggerEvent: string;
//         emittEvent: string;
//         token: string;
//         commTrack: CommTrack;
//         isNotification: boolean | null;
//     },
//     req: ICdRequest | null;
//     resp: ICdResponse | null;
// };

export interface ICdPushEnvelop {
    pushData: {
        appId?: string;
        appSockets?: ISocketItem[];
        pushGuid: string;
        m?: string;
        pushRecepients: ICommConversationSub[];
        triggerEvent: string;
        emittEvent: string;
        token: string;
        commTrack: CommTrack;
        isNotification: boolean | null;
        isAppInit?: boolean | null;
    },
    req: ICdRequest | null,
    resp: ICdResponse | null
};

export interface ISocketItem{
    socketId:string;
    name:string;
    socketGuid?:string;
}

export interface ICommConversationSub {
    userId: number; // subscriber userId
    subTypeId: number; // type of subscriber
    commconversationId?: number;
    commconversationsubId?: number;
    commconversationsubInvited?: boolean;
    commconversationsubAccepted?: boolean;
    groupId?: number; // can be used to represent chat room in websocket service
    // commTrack: CommTrack;
    cdObjId: CdObjId;
}

/**
 * interface for tracking pushed message
 * push stages:
 * - relayed: message has arrived
 * - pushed: message has been pushed from the server to recepient
 * - delivered: message has reached the recepient
 * - completed: server is notified that message was delivered and sender notified
 */
export interface CommTrack {
    initTime: number | null;
    relayTime: number | null;
    pushed: boolean;
    pushTime: number | null;
    relayed: boolean;
    deliveryTime: number | null;
    delivered: boolean;
    completed: boolean;
    completedTime: number | null;
}


/**
 * triggerEvent: the servier event to handle a given message
 * emittEvent: the event that handles message at the client
 * sFx: server function that handles a given message
 * cFx: client function that handles a given message
 */
export interface PushEvent {
    triggerEvent: string;
    emittEvent: string;
    sFx?: string;
    cFx?: string;
}

export interface IServiceInput {
    serviceInstance?: any;
    serviceModel: any;
    mapping?: any;
    serviceModelInstance?: any;
    docName?: string;
    cmd?: Cmd;
    data?: any;
    dSource?: number;
    extraInfo?: boolean;
    modelName?: string;
    modelPath?: string;
    fetchInput?: IFetchInput;
}

export interface Cmd {
    action: string;
    query: IQuery | IQbInput;
}

// query builder input
export interface IQbInput {
    select?: string[];
    update?: object;
    where: IQbFilter[];
    distinct?: boolean;
    take?: number;
    skip?: number;
}

export interface IQuery {
    select?: string[];
    update?: object;
    where: any;
    distinct?: boolean;
    take?: number;
    skip?: number;
    jFilters?: IJFilter[];
    order?:any;
    class?:string;
}

export interface IFetchInput{
    url: string;
    optins?:{
        method?: string;
        body?: string,
        headers?: {
            'Content-Type'?: string;
            'X-Parse-Application-Id'?: string;
            'X-Parse-REST-API-Key'?:string;
        }
    }
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

// export interface ICommConversationSub {
//     userId: number; // subscriber user_id
//     subTypeId: number; // type of subscriber
//     cdObjId: number;
//     commconversation_id?: number;
//     commconversationsub_id?: number;
//     commconversationsub_invited?: boolean;
//     commconversationsub_accepted?: boolean;
// }

export interface ICommConversationSub {
    userId: number; // subscriber userId
    subTypeId: number; // type of subscriber
    commconversationId?: number;
    commconversationsubId?: number;
    commconversationsubInvited?: boolean;
    commconversationsubAccepted?: boolean;
    groupId?: number; // can be used to represent chat room in websocket service
    // commTrack: CommTrack;
    cdObjId: CdObjId;
}

export interface CommTrack {
    initTime: number | null,
    relayTime: number | null,
    relayed: boolean,
    deliveryTime: number | null,
    deliverd: boolean,
}

export interface CdObjId {
    ngModule: string | null;
    resourceName: string | null;
    resourceGuid: string | null;
    jwtToken: string | null;
    socket: any;
    socketId?: string;
    commTrack: CommTrack | null;
}

export interface IAclCtx {
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

export interface IAllowedModules {
    modules$: Observable<AclModuleViewModel[]>;
    modulesCount: number;
}

export interface IMenuRelations {
    menuParent: MenuViewModel;
    menuChildren: MenuViewModel[];
}

/**
 * constraining the update attribute to specific models in different services.
 * By using Array<keyof T> for the select attribute, you constrain the select array to valid fields of the model type T.
 * This approach improves type safety and ensures that you don't accidentally select invalid fields.
 * This type-safe approach helps prevent errors at compile-time, making your code more reliable and maintainable.
 */
// export type SelectType<T> = Array<keyof T>;
// export interface IQuery<T = any> {
//     select?: SelectType<T>;
//     update?: T;
//     where: any;
//     take?: number;
//     skip?: number;
//     jFilters?: IJFilter[];
//     order?: any;
//     class?: string;
// }

export interface QueryInput {
    select?: string[];
    where?: any;
    take?: number;
    skip?: number;
}

// query builder filter
export interface IQbFilter {
    field: string;
    operator: string;
    val: string;
    conjType?: string;
    dataType: string;
    jPath?: string;
}

// json field filter
export interface IJFilter {
    jField: string;
    jPath: string;
    pathValue: any;
}

export interface ObjectItem {
    key: string,
    value: any
}

export interface CreateIParams {
    serviceInput: IServiceInput;
    controllerData: any;
}

export interface CacheData {
    key: string;
    value: string;
    initUuid?: string;
    initTime?: string;
}

export interface JWT {
    jwtToken: string;
    checked: boolean;
    checkTime: number;
    authorized: boolean;
}






