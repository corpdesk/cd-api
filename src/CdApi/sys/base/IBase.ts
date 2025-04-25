/**
 * This is the core source for Corpdesk
 */
import { Observable } from "rxjs";
import { AclModuleViewModel } from "../moduleman/models/acl-module-view.model";
import { MenuViewModel } from "../moduleman/models/menu-view.model";
import { IUserProfile, UserModel } from "../user/models/user.model";
import { SessionModel } from "../user/models/session.model";
import { ConsumerModel } from "../moduleman/models/consumer.model";
import { CompanyModel } from "../moduleman/models/company.model";
import { DataSource } from "typeorm";

/**
 * -------------------------------------------------------------------------------------------------------------------------
 * interface ICdRequest:
 * -------------------------------------------------------------------------------------------------------------------------
 * This is the interface for network request.
 * The request can target an Corpdesk API, cd-api, 
 * or sent via Corpdesk Websocket server, cd-sio to target another
 * frontend corpdesk module. When used in cd-sio, it can have multiple targets.
 * A given request can also nest another request as per developer requrements.
 * 
 * "Sys" as a value for ICdRequest.ctx implies the target module resides in the system directory of the target api.
 * System directory hosts modules that are meant to offer common services to general applications.
 * Corpdesk system directory can be visualised as the operating system packages shipped with Corpdesk to support "Apps".
 * There are also "Apps" developed by corpdesk developers but resides in "app" directory. 
 * These application are the types that are not core to operation of any Corpdesk application. 
 * For example accounts package or any application for business operation
 * "App" as a value for ICdRequest.ctx implies the target module resides in the application directory of the target api.
 * Applications are general applications that can be developed by 3rd party developers.
 * 
 * Case convention:
 * ctx: camel case with first character being capital.
 * m: camel case with first character being capital.
 * c: camel case with first character being capital.
 * a: camel case with first character being capital.
 * 
 * TODO:
 * It must be said that these solutions are constantly being tested and refined. 
 * There are several finer points which were implemented much earlier but later refinment of policy makes them anti-pattern. Changing them can break existing application.
 * Such modifications will requre careful planning
 * Below are some identified areas for change:
 * token name: Session token key name needs to be standardised. During corpdesk development it has aquired a number of references.
 * Eg "token", "cdToken", "cd-token", "sid". 
 * There is need to standardise how it gets refered and identified by consistent name
 * 
 * Example:
 * In the example below, the request is targeting "User" module, "User" controller and the action is "Login"
 * The data input is based on the IUserModule at the api. In this case what is requred is userName, password
 * The way it has been used here is an anti-pattern.
 * consumerGuid is part of IConsumer interface.
 * If you examine the interface EnvelopFValItem, which form part of ICdRequest, there is the option of extData
 * So the base place for consumerGuid is extData.
 * The object below is how it was coded before refinement of interface policy.
 * This correction will have to be made at a later date.
 * 
 * {
    "ctx": "Sys",
    "m": "User",
    "c": "User",
    "a": "Login",
    "dat": {
        "f_vals": [
        {
            "data": {
            "userName": "karl",
            "password": "secret",
            "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
            }
        }
        ],
        "token": null
    },
    "args": null
    }
 */
export interface ICdRequest {
  ctx: string; // can be either "Sys" or "App"
  m: string; // target module name. Note that at the source codes, the full name has "Module" word following the given name here.
  c: string; // target controler name. Note that at the source codes, the full name has "Controller" word following the given name here.
  a: string; // target action name
  dat: EnvelopDat; // payload data
  args: any | null; // for future or forseable extension. Was set at design time but has not been used so far. Recommended to be kept as is
}

export interface EnvelopDat {
  f_vals: EnvelopFValItem[]; // settings for the command. The array dimension was meant to have capacity for sending multiple commands in the future
  token: string | null; // session token.
}

export interface EnvelopFValItem {
  query?: IQuery; // see  IQuery notes
  data?: any; // set according to the interface of a given Corpdesk controller interface. This is synonimous with model of a given entity targeting a database table or similar
  extData?: any; // for use in scenario where extra data is used to complete the command. For example when the target action need pre or post process. The details are set by develper at the controller action
}

/**
 * for setting up query akin to sql query but can also be used against non-sql queries.
 * At its best the syntx should not be dependent on target data store type.
 */
export interface IQuery {
  select?: string[];
  update?: object;
  where: IQueryWhere;
  jsonUpdate?: IJsonUpdate[]; // This was developed for JSON columns. Its use can be found in the implementation of UserProfile and how CoopMemberProfile has extended UserProfile
  distinct?: boolean;
  take?: number;
  skip?: number;
  jFilters?: IJFilter[];
  order?: any;
  class?: string;
}

export interface IQueryWhere {
  // new AND/OR logic
  andWhere?: Array<{ [field: string]: string }>;
  orWhere?: Array<{ [field: string]: string }>;

  // legacy-compatible structures
  [field: string]: any; // for flat objects or keys not matching and/or
}

// custom json update
export interface IJsonUpdate {
  modelField?; // name of the json column. Capacity to update multiple json columns in a given row
  path: any; // path to a target item in JSON data
  value: any; // value to apply to a tarteg item
}

// json field filter
export interface IJFilter {
  jField: string;
  jPath: string;
  pathValue: any;
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

/**
 * -------------------------------------------------------------------------------------------------------------------------
 * interface ICdResponse
 * -------------------------------------------------------------------------------------------------------------------------
 * This is the interface for response data
 * It has two sections.
 * 1. app_state
 * 2. data
 *
 */
export interface ICdResponse {
  app_state: {
    success: boolean; // tels whether the process was successfull or not
    info: IRespInfo; // status messages including error details if any or standard message of success
    sess: ISessResp; // session status data
    cache: object;
    sConfig?: IServerConfig;
  };
  data: object;
}

export interface IRespInfo {
  messages: string[]; // array of errors encountered
  code: string; // error code. Corpdesk use this to code the exact spot of error by controller and action
  app_msg: any; // general response message (can be set with string, or null)
}

export interface ISessResp {
  cd_token?: string; // corpdesk token
  userId?: number | null; // current user id
  jwt: {
    jwtToken: string;
    checked: boolean;
    checkTime: number;
    authorized: boolean;
  } | null; // jwt data
  ttl: number; // server settings for session lifetime
  initUuid?: string; // initialization guid of session
  initTime?: string; // when the session started
  clientId?: any; // OPtonal. for diagnosis for server view of the client.
}

export interface ISessionDataExt {
  currentUser: UserModel;
  currentUserProfile: IUserProfile;
  currentSession: SessionModel;
  currentConsumer: ConsumerModel;
  currentCompany: CompanyModel;
}

export interface IServerConfig {
  usePush: boolean;
  usePolling: boolean;
  useCacheStore: boolean;
}

/**
 * 
 * -------------------------------------------------------------------------------------------------------------------------
 * interface IJFilter
 * -------------------------------------------------------------------------------------------------------------------------
 * This interface was meant to integrate with laid procedure for selecting item nesed in JSON field
 * Below is a sample of how request can be made to a test method in InteRact module
 * 
     * {
            "ctx": "Sys",
            "m": "InteRact",
            "c": "InteRactMedia",
            "a": "TestJsonQuery",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select": [
                                "inte_ractPubId",
                                "inte_ractPubName",
                                "inte_ractPubDescription",
                                "inte_ractPubGuid",
                                "docId",
                                "inteRactPubTypeId",
                                "public",
                                "m",
                                "c",
                                "j_val"
                            ],
                            "where": [
                                {
                                    "conjType": "",// options null, or omit the property
                                    "dataType":"json",
                                    "field": "j_val",
                                    "jPath": "'$.domain.group.doc_id'",
                                    "operator": "=",
                                    "val": 11091
                                },
                                {
                                    "field": "doc_id",
                                    "fieldType": "json",
                                    "operator": "=",
                                    "val": 11121,
                                    "conjType": "and" 
                                }
                            ]
                        }
                    }
                ],
                "token": "fc735ce6-b52f-4293-9332-0181a49231c4"
            },
            "args": {}
        }
    
        References:
        file path: cd-api/src/CdApi/sys/inte-ract/controllers/inte-ract-pub.controller.ts
        method: TestJsonQuery
        file: cd-api/src/CdApi/sys/inte-ract/services/inte-ract-media.service.ts
        method: testJsonQuery

     * 
     */



export const CDOBJ_TYPE_USER = 9;
export const CDOBJ_TYPE_GROUP = 10;

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

export const DEFAULT_CD_REQUEST: ICdRequest = {
  ctx: "Sys",
  m: "",
  c: "",
  a: "",
  dat: {
    f_vals: [
      {
        data: {},
      },
    ],
    token: "",
  },
  args: {},
};

export const DEFAULT_CD_RESPONSE: ICdResponse = {
  app_state: {
    success: false,
    info: {
      messages: [],
      code: "",
      app_msg: "",
    },
    sess: {
      cd_token: "",
      jwt: null,
      ttl: 600,
    },
    cache: {},
  },
  data: [],
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
  };
  req: ICdRequest | null;
  resp: ICdResponse | null;
}

export interface ISocketItem {
  socketId: string;
  name: string;
  socketGuid?: string;
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
 * extDat: extra data
 */
export interface PushEvent {
  triggerEvent: string;
  emittEvent: string;
  sFx?: string;
  cFx?: string;
}

export interface IServiceInput {
  primaryKey?: string; // primary key of the subject model
  serviceInstance?: any; // handle of the subject service
  serviceModel: any; // subject model
  mapping?: any;
  serviceModelInstance?: any; // instance of subject model
  docName?: string;
  cmd?: Cmd;
  data?: any;
  dSource?: number | DataSource;
  extraInfo?: boolean;
  modelName?: string;
  modelPath?: string;
  fetchInput?: IFetchInput;
}

export interface IFetchInput {
  url: string;
  optins?: {
    method?: string;
    body?: string;
    headers?: {
      "Content-Type"?: string;
      "X-Parse-Application-Id"?: string;
      "X-Parse-REST-API-Key"?: string;
    };
  };
}

export interface Cmd {
  action?: string;
  query: IQuery | IQbInput;
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
  initTime: number | null;
  relayTime: number | null;
  relayed: boolean;
  deliveryTime: number | null;
  deliverd: boolean;
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
  currentUser: any;
  module: any;
}

export interface IAclRole {
  aclRoleName?: string;
  permissions?: IAclPermission;
}

export interface IAclPermission {
  userPermissions: IPermissionData[];
  groupPermissions: IPermissionData[];
}

/**
 * Improved versin should have just one interface and
 * instead of userId or groupId, cdObjId is applied.
 * This would then allow any object permissions to be set
 * Automation and 'role' concept can then be used to manage permission process
 */
export interface IPermissionData {
  cdObjId: number;
  hidden: boolean;
  field: string;
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface ISelectedMenu {
  moduleMenuData?: MenuViewModel[];
  selectedItem: MenuViewModel;
  selectedId?: number;
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

// export interface QueryInput {
//     select?: string[];
//     where?: any;
//     take?: number;
//     skip?: number;
// }

export interface QueryInput {
  select?: string[];
  where?: any; // Already exists, but we'll use it for dynamic WHERE conditions
  update?: Record<string, any>; // New property to specify which fields to update
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

export interface ObjectItem {
  key: string;
  value: any;
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

/**
 * Rather than have just some standard levels of operation, this is an expressive flagging that can
 * serve in very many cases
 *
 * RunMode defines the operational state of the system.
 * These are ordered by increasing level of verbosity, system availability, and openness.
 * Use these levels for environment-aware logging, diagnostics, and operational control.
 */
export enum RunMode {
  /**
   * System is turned off. No operations should be permitted.
   */
  SYSTEM_SHUTDOWN = 0,

  /**
   * Restricted to maintenance tasks only. No external or user-triggered API access.
   */
  MAINTENANCE_MODE = 1,

  /**
   * Only the most essential functions are operational (e.g., auth, health checks).
   */
  CRITICAL_ONLY = 2,

  /**
   * Enables safe-level debugging and system inspection (non-invasive).
   */
  SAFE_DEBUG_MODE = 3,

  /**
   * Default/standard operating mode.
   */
  NORMAL_OPERATION = 4,

  /**
   * Allows logging of verbose runtime details.
   */
  VERBOSE_MONITORING = 5,

  /**
   * Enables deep diagnostics such as full stack traces, DB query logs, etc.
   */
  DIAGNOSTIC_TRACE = 6,

  /**
   * Enables in-depth audit and profiling for performance or security reviews.
   */
  FULL_AUDIT_AND_PROFILING = 7,

  /**
   * Simulated environment where data persistence is disabled (e.g., for safe testing).
   */
  SANDBOX_SIMULATION = 8,

  /**
   * Uses mocked data sources, often for frontend or integration testing.
   */
  MOCK_DATA_MODE = 9,

  /**
   * Full developer freedom: exposes internals, bypasses restrictions, logs everything.
   */
  UNRESTRICTED_DEVELOPER_MODE = 10,
}

/**
 * This is an effort to standardize corpdesk return by a function or method.
 * All corpdesk functions and methods are expected to implement CdFxReturn (progressively)
 * - Consistency Across All Corpdesk Applications
 * - Safer Type Handling
 * - Improved Error Handling
 * interface as a return type.
 * Proposed: 6th Feb 2025
 * Adoption is meant to be progressive over time.
 * The principle if borrowed from Go's tuple returns
 */
export interface CdFxReturn<T> {
  data: T | null;
  state: boolean;
  message?: string; // Optional error/success message
}

export const CD_FX_FAIL = {
  data: null,
  state: false,
  message: 'Failed!',
};
