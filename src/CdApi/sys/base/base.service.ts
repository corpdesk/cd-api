// import fetch from 'node-fetch';
import { v4 as uuidv4 } from "uuid";
// import { color, log, red, green, cyan, cyanBright, blue, yellow } from 'console-log-colors';
// import { bold, white, gray } from 'console-log-colors';
import * as Lá from "lodash";
import { instanceToPlain } from "class-transformer";
import {
  CreateIParams,
  ICdRequest,
  ICdResponse,
  IControllerContext,
  IQuery,
  IRespInfo,
  IServiceInput,
  ISessResp,
  ObjectItem,
  CacheData,
  IQbInput,
  ISessionDataExt,
  IJsonUpdate,
  RunMode,
  CdResponseState,
  HttpState,
} from "./IBase";
import {
  EntityMetadata,
  Repository,
  Like,
  // getConnection,
  // createConnection,
  // ConnectionOptions,
  // getConnectionManager,
  // Connection,
} from "typeorm";
import { Observable, from } from "rxjs";
import moment from "moment";
import { Database } from "./connect";
import { ConnectSqlite } from "./connectSqlite";
// import * as redis from 'redis';
import { createClient } from "redis";
import { DocModel } from "../moduleman/models/doc.model";
import { SessionService } from "../user/services/session.service";
import { SessionModel } from "../user/models/session.model";
import { DocService } from "../moduleman/services/doc.service";
import config, { AppDataSource, sqliteConfigFx } from "../../../config";
import { ConnectionTest } from "./connection-test";
// import { createConnection } from 'typeorm';
import { MysqlDataSource } from "./data-source";
import { NextFunction, Request, Response } from "express";
import { UserModel } from "../user/models/user.model";

import { getDataSource } from "./data-source";
import { Logging } from "./winston.log";
import { RedisService } from "./redis-service";
import { QueryBuilderHelper } from "../utils/query-builder-helper";
import { EntityAdapter } from "../utils/entity-adapter";
import { TypeOrmDatasource } from "./type-orm-connect";
import { safeStringify } from "../utils/safe-stringify";
import { CdLogger } from "../utils/cd-logger";
import { JsonHelper } from "../utils/json-helper";

const USER_ANON = 1000;
const INVALID_REQUEST = "invalid request";

interface A {
  member: string;
}

export class BaseService {
  cdToken: string;
  cdResp: ICdResponse; // cd response
  cls;
  err: string[] = []; // error messages
  db;
  // sqliteDb;
  sqliteConn;
  cuid = USER_ANON;
  consumer_guid;
  debug = true;
  pl;
  svSess: SessionService;
  sess: SessionModel[];
  // sessDataExt: ISessionDataExt;
  i: IRespInfo = {
    messages: [],
    code: "",
    app_msg: "",
    respState: {
      cdLevel: null,
      cdDescription: null,
      httpCode: null,
      httpDescription: null,
    },
  };
  isInvalidFields = [];
  isRegRequest = false;
  redisClient;
  svRedis: RedisService;
  logger: Logging;
  // cdLog: CdLogger;
  entityAdapter: EntityAdapter;

  constructor() {
    // this.redisInit();
    this.entityAdapter = new EntityAdapter();
    this.cdResp = this.initCdResp();
    this.logger = new Logging();
    this.svRedis = new RedisService();
  }
  models = [];
  sqliteModels = [];

  private repo: any;
  private docRepository: any;
  ds: any = null;

  async init(req, res) {
    this.logger.logDebug("BaseService::init()/01:");
    try {
      if (!this.db) {
        this.db = new TypeOrmDatasource();
        this.ds = await this.db.getConnection(); // ✅ Store DataSource
      }
      this.logger.logDebug("BaseService::init()/this.models:", this.models);
    } catch (e) {
      this.logger.logDebug("BaseService::init()/02:");
      this.logger.logDebug(
        `BaseService::init() failed:${(e as Error).message}`
      );
      this.err.push(`BaseService::init() failed:${(e as Error).message}`);
    }
  }

  async initSqlite(req, res) {
    const iMax = 5;
    const i = 1;
    try {
      this.logger.logDebug("BaseService::initSqlite()/01");
      if (this.sqliteConn) {
        this.logger.logDebug("BaseService::initSqlite()/02");
      } else {
        this.logger.logDebug("BaseService::initSqlite()/03");
        // await this.setSLConn(i)
        this.sqliteConn = await this.db;
      }
    } catch (e) {
      this.logger.logDebug("BaseService::initSqlite()/04");
      this.logger.logDebug("initSqlite()/Error:", e);
      // const p = e.toString().search('AlreadyHasActiveConnectionError');
      // if (p === -1 && i < iMax) {
      //     i++;
      //     await this.setSLConn(i);
      // }
      this.err.push(e.toString());
    }
  }

  async setSLConn(i) {
    // const slConfig: ConnectionOptions = await sqliteConfigFx(
    //   `sqlite${i.toString()}`
    // );
    try {
      await this.db.getConnection(`sqlite${i.toString()}`);
      this.sqliteConn = await this.db
        .getConnection(`sqlite${i.toString()}`)
        .connect();
    } catch (error) {
      // this.sqliteConn = await createConnection(slConfig);
    }
  }

  connSLClose() {
    if (this.sqliteConn) {
      this.sqliteConn.close();
    }
  }

  // async connectDatabase(i: number = 1): Promise<Connection> {
  //   this.logger.logDebug("connectDatabase()/01");
  //   const opts: ConnectionOptions = await sqliteConfigFx(
  //     `sqlite${i.toString()}`
  //   );
  //   let connection: Connection | undefined;
  //   try {
  //     this.logger.logDebug("connectDatabase()/02");
  //     const connectionManager = getConnectionManager();
  //     this.logger.logDebug("connectDatabase()/03");
  //     // calling connection.close() doesn't actually delete it from the map, so "has" will still be true;
  //     // so if this is anything but the first attempt, try to create the connection again
  //     if (connectionManager.has(opts.name) && i === 1) {
  //       this.logger.logDebug("connectDatabase()/04");
  //       // using a connection already connected (note this is a simplified version for lambda environment ...
  //       // see also: https://github.com/typeorm/typeorm/issues/3427
  //       connection = await connectionManager.get(`sqlite${i.toString()}`);
  //       this.logger.logDebug("connectDatabase()/05");
  //       if (!connection.isConnected) {
  //         this.logger.logDebug("connectDatabase()/06");
  //         throw new Error(
  //           "Existing connection found but is not really connected"
  //         );
  //       }
  //       this.logger.logDebug("connectDatabase()/07");
  //     } else {
  //       this.logger.logDebug("connectDatabase()/08");
  //       connection = await connectionManager.create(opts);
  //       this.logger.logDebug("connectDatabase()/09");
  //       await connection.connect();
  //     }
  //     this.logger.logDebug("connectDatabase()/10");
  //     return await connection;
  //   } catch (e) {
  //     i++;
  //     this.logger.logDebug("connectDatabase()/11");
  //     if (i >= 5) {
  //       console.error(
  //         "Giving up after too many connection attempts, throwing error"
  //       );
  //       throw e;
  //     }
  //     this.logger.logDebug("connectDatabase()/12");
  //     if (connection || connection.isConnected || connection.close()) {
  //       this.logger.logDebug("connectDatabase()/13");
  //       const delayInMilliseconds = 200 * i;
  //       await setTimeout(async () => {
  //         // connection.close();
  //         return await this.connectDatabase(i);
  //       }, delayInMilliseconds);
  //     }
  //   }
  // }

  // switched off while trying upgraded typeorm codes
  // repo(req, res, serviceModel) {
  //     try {
  //         this.logger.logDebug('BaseService::repo()/serviceModel:', serviceModel)
  //         return this.db.getConnection().getRepository(serviceModel);
  //     } catch (e) {
  //         return this.serviceErr(req, res, e, 'BaseService:repo');
  //     }
  // }

  // /**
  //  * Connect to a database using the TypeORM ConnectionManager. Adds database to the manager if it is new. Tests database connection after connecting.
  //  * Reports the true current connection state regardless of:
  //  * - whether the connection already existed
  //  * - whether the database connection was lost silently after connecting previously.
  //  * @param database Database configuration model to try and create
  //  * @param stayConnected Will disconnect after testing by default. Change to true to keep the connection alive
  //  * @returns Whether the connection was successful
  //  */
  // async connect(database: ConnectionOptions, stayConnected = false): Promise<Connection> {
  //     let canConnect = false
  //     let con
  //     this.logger.logDebug('BaseService::connect()/01')
  //     const conMan = getConnectionManager()

  //     try {
  //         this.logger.logDebug('BaseService::connect()/02')
  //         if (conMan.has(database.name)) {
  //             this.logger.logDebug('BaseService::connect()/03')
  //             // If database already exists, get it
  //             con = await conMan.get(database.name)
  //         } else {
  //             this.logger.logDebug('BaseService::connect()/04')
  //             // If connection doesnst exist, add it
  //             con = await conMan.create(database)
  //         }
  //         this.logger.logDebug('BaseService::connect()/05')
  //         // // Try to connect
  //         // if (!con.isConnected) await con.connect()
  //         // this.logger.logDebug('BaseService::connect()/06')
  //         // // Store connection result
  //         // canConnect = con.isConnected
  //         // if (!canConnect) return false
  //         // this.logger.logDebug('BaseService::connect()/07')
  //         // // If TypeORM claims a connection, test it on the test table
  //         // try {
  //         //     this.logger.logDebug('BaseService::connect()/08')
  //         //     const conTest = (await con.getRepository(ConnectionTest).findOne()) || new ConnectionTest(0)
  //         //     conTest.i++
  //         //     conTest.save()
  //         // } catch (e) {
  //         //     canConnect = false
  //         // }

  //         // Disconnect if it was only a test. Is default
  //         if (!stayConnected) await con.close()
  //     } catch (e) {
  //         console.error(e)
  //     }

  //     return await con;
  // }

  /**
   * resolve the class that is being called
   * via module, controller(class) and action(method)
   * @param req
   * @param res
   * @param clsCtx
   * @returns
   */
  async resolveCls(req, res, clsCtx) {
    try {
      this.logger.logDebug("BaseService::resolveCls()/01:");
      this.logger.logDebug("BaseService::resolveCls/clsCtx.path:", clsCtx.path);
      const eImport = await import(clsCtx.path);
      this.logger.logDebug("BaseService::resolveCls()/02:");
      const eCls = eImport[clsCtx.clsName];
      this.logger.logDebug("BaseService::resolveCls()/03:");
      const cls = new eCls();
      this.ds = clsCtx.dataSource;
      this.logger.logDebug("BaseService::resolveCls()/04:");
      if (this.sess) {
        // set sessData in req so it is available thoughout the bootstrap
        req.post.sessData = this.sess;
      }
      await cls[clsCtx.action](req, res);
    } catch (e) {
      this.serviceErr(req, res, e, "BaseService:resolveCls");
    }
  }

  async serviceErr(req, res, e, eCode, lineNumber = null) {
    const svSess = new SessionService();
    try {
      svSess.sessResp.cd_token = req.post.dat.token;
    } catch (er) {
      svSess.sessResp.cd_token = "";
      this.err.push(e.toString(er));
    }

    svSess.sessResp.ttl = svSess.getTtl();
    this.setAppState(true, this.i, svSess.sessResp);
    this.err.push(e.toString());
    const i = {
      messages: await this.err,
      code: eCode,
      app_msg: `Error at ${eCode}: ${e.toString()}`,
    };
    await this.setAppState(false, i, svSess.sessResp);
    this.cdResp.data = [];
    return await this.respond(req, res);
  }

  async returnErr(req, res, i: IRespInfo) {
    const sess = this.getSess(req, res);
    await this.setAppState(false, i, sess);
    return await this.respond(req, res);
  }

  entryPath(pl: ICdRequest) {
    this.logger.logDebug("BaseService::entryPath/pl:", pl);
    const ret = `../../${pl.ctx.toLowerCase()}/${this.toCdName(
      pl.m
    )}/controllers/${this.toCdName(pl.c)}.controller`;
    this.logger.logDebug("BaseService::entryPath()/ret:", ret);
    return ret;
  }

  // from camel to hyphen seperated then to lower case
  toCdName(camel) {
    this.logger.logDebug("BaseService::entryPath/camel:", camel);
    const ret = camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    this.logger.logDebug("BaseService::toCdName()/ret:", ret);
    return ret;
  }

  async valid(req, res): Promise<boolean> {
    const pl = req.post;
    this.logger.logDebug("BaseService::valid()req.post:", {
      pl: JSON.stringify(req.post),
    });
    this.pl = pl;
    if (await this.noToken(req, res)) {
      return true;
    } else {
      if (!this.cdToken) {
        await this.setSess(req, res);
      }
      if (!this.instanceOfCdResponse(pl)) {
        return false;
      }
      if (!this.validFields(req, res)) {
        return false;
      }
    }
    return true;
  }

  async noToken(req, res) {
    this.logger.logDebug("BaseService::noToken()/01");
    this.logger.logDebug("BaseService::noToken()/req.post:", {
      pl: JSON.stringify(req.post),
    });
    const pl = req.post;
    const ctx = pl.ctx;
    const m = pl.m;
    const c = pl.c;
    const a = pl.a;
    let ret: boolean = false;
    if (!ctx || !m || !c || !a) {
      this.setInvalidRequest(req, res, "BaseService:noTocken:01");
    }

    /**
     * conditions that are allowed without token requirement
     */
    if (
      m === "User" &&
      (a === "Login" || a === "Register" || a === "ActivateUser")
    ) {
      this.logger.logDebug("BaseService::noToken()/02");
      if (m === "User" && a === "Register") {
        this.logger.logDebug("BaseService::noToken()/03");
        this.isRegRequest = true;
      }
      ret = true;
    }
    // exempt reading list of consumers. Required during registration when token is not set yet
    if (m === "Moduleman" && c === "Consumer" && a === "GetAll") {
      ret = true;
    }
    // exempt anon menu calls
    if (m === "Moduleman" && c === "Modules" && a === "GetAll") {
      ret = true;
    }

    // exempt websocket initialization calls
    if (m === "CdPush" && c === "Websocket" && a === "Create") {
      ret = true;
    }

    // exampt mpesa call backs
    if ("MSISDN" in pl) {
      ret = true;
    }
    this.logger.logDebug("BaseService::noToken()/returning ret:", {
      return: ret,
    });
    return ret;
  }

  isRegisterRequest() {
    return this.isRegRequest;
  }

  /**
   * implement validation of fields
   * @param req
   * @param res
   * @returns
   */
  validFields(req, res) {
    /**
     * 1. deduce model directory from the req.post
     * 2. import model
     * 3. verify if fields exists
     */
    return true;
  }

  instanceOfCdResponse(object: any): boolean {
    return (
      "ctx" in object &&
      "m" in object &&
      "c" in object &&
      "a" in object &&
      "dat" in object &&
      "args" in object
    );
  }

  /**
   * for setting up response details
   * @param Success
   * @param Info
   * @param Sess
   */
  // async setAppState(succ: boolean, i: IRespInfo | null, ss: ISessResp | null) {
  //   const sess = new SessionService();
  //   if (succ === false) {
  //     this.cdResp.data = [];
  //   }

  //   this.cdResp.app_state = {
  //     success: succ,
  //     info: i,
  //     sess: ss,
  //     cache: {},
  //     sConfig: {
  //       usePush: config.usePolling,
  //       usePolling: config.usePush,
  //       useCacheStore: config.useCacheStore,
  //     },
  //   };
  // }
  async setAppState(succ: boolean, i: IRespInfo | null, ss: ISessResp | null) {
    this.logger.logDebug("BaseService::setAppState()/01");

    if (succ === false) {
      this.logger.logDebug("BaseService::setAppState()/02");
      this.cdResp.data = [];
    }
    // if(this.sess){
    //   this.setClientId(ss, this.sess[0]);
    // } else {
    //   this.logger.logDebug('BaseService::setAppState()/03')
    //   CdLogger.warn('session is not set')
    // }

    this.logger.logDebug("BaseService::setAppState()/ss:", ss);
    this.cdResp.app_state = {
      success: succ,
      info: i,
      sess: ss,
      cache: {},
      sConfig: {
        usePush: config.usePolling,
        usePolling: config.usePush,
        useCacheStore: config.useCacheStore,
      },
    };
  }

  /**
   * Under selected modes, client ip may be necessary as part of response
   * @param ss
   */
  getClientId(clientId: any) {
    this.logger.logDebug("BaseService::setClientId()/01");
    const allowedModes = [
      RunMode.UNRESTRICTED_DEVELOPER_MODE,
      RunMode.VERBOSE_MONITORING,
      RunMode.DIAGNOSTIC_TRACE,
      RunMode.MAINTENANCE_MODE,
    ];

    if (allowedModes.includes(config.runMode)) {
      this.logger.logDebug("BaseService::setClientId()/02");
      this.logger.logDebug("BaseService::setClientId()/clientId:", clientId);
      return clientId;
    } else {
      this.logger.logDebug("BaseService::setClientId()/03");
      CdLogger.warn("clientId is not allowed at this time");
      return null;
    }
  }

  setInvalidRequest(req, res, eCode: string) {
    this.err.push(INVALID_REQUEST);
    const i: IRespInfo = {
      messages: this.err,
      code: eCode,
      app_msg: "",
    };
    const sess = this.getSess(req, res);
    this.setAppState(false, i, sess);
    res.status(200).json(this.cdResp);
  }

  getSess(req, res) {
    return null; // yet to implement
  }

  sessIsValid(pl) {
    // const sess = new SessionService()
  }

  /**
   * For validating IJsonUpdate array
   * @param jsonUpdate
   * @param rootInterface
   * @returns
   */
  validateJsonUpdate<T>(
    jsonUpdate: IJsonUpdate[],
    rootInterface: T
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    function traversePath(
      currentPath: string[],
      currentInterface: any
    ): boolean {
      // If no path left to validate, return true
      if (currentPath.length === 0) return true;

      const [currentKey, ...remainingPath] = currentPath;

      if (Array.isArray(currentInterface) && currentKey === "[0]") {
        // Check if the interface is an array and the key indicates an index
        return traversePath(remainingPath, currentInterface[0]);
      } else if (currentInterface && typeof currentInterface === "object") {
        // Check if the key exists in the interface
        if (!(currentKey in currentInterface)) {
          errors.push(
            `Invalid path key '${currentKey}' at '${currentPath.join(".")}'`
          );
          return false;
        }
        // Continue traversing the remaining path
        return traversePath(remainingPath, currentInterface[currentKey]);
      } else {
        // If the structure doesn't match, log an error
        errors.push(
          `Unexpected type at '${currentPath.join(
            "."
          )}'. Expected object or array.`
        );
        return false;
      }
    }

    // Validate each update item
    jsonUpdate.forEach((update) => {
      if (!update.modelField || update.modelField !== "cdDevProjectData") {
        errors.push(`Invalid modelField: '${update.modelField}'`);
        return;
      }

      const { path } = update;
      if (!Array.isArray(path) || path.length === 0) {
        errors.push(`Invalid path: '${JSON.stringify(path)}'`);
        return;
      }

      // Start traversal from the root interface
      traversePath(path, rootInterface);
    });

    return { valid: errors.length === 0, errors };
  }

  updateJsonData(jsonUpdate: IJsonUpdate, jsonData: any): any {
    this.logger.logDebug(
      "BaseService::updateJsonData()/jsonUpdate1:",
      jsonUpdate
    );
    this.logger.logDebug("BaseService::updateJsonData()/jsonData1:", jsonData);

    try {
      // Validate `jsonUpdate` structure
      if (!jsonUpdate || typeof jsonUpdate !== "object") {
        this.err.push("Invalid jsonUpdate object.");
        return null;
      }
      if (!Array.isArray(jsonUpdate.path) || jsonUpdate.path.length === 0) {
        this.err.push("Invalid jsonUpdate path: Must be a non-empty array.");
        return null;
      }

      // Validate `jsonData`
      if (typeof jsonData !== "object" || jsonData === null) {
        this.err.push("Invalid jsonData: Must be a non-null object.");
        return null;
      }

      // Traverse the path to reach the target node
      let target = jsonData;
      const pathLength = jsonUpdate.path.length;

      for (let i = 0; i < pathLength - 1; i++) {
        const key = jsonUpdate.path[i];
        this.logger.logDebug("BaseService::updateJsonData()/key0:", key);

        if (key.startsWith("[") && key.endsWith("]")) {
          this.logger.logDebug("BaseService::updateJsonData()/key1:", key);
          // Handle array index
          const index = parseInt(key.slice(1, -1), 10);
          if (isNaN(index) || !Array.isArray(target)) {
            this.err.push(
              `Invalid path at '${key}': Expected a valid array index in an array.`
            );
            return null;
          }
          target = target[index];
        } else {
          // Handle object key
          this.logger.logDebug("BaseService::updateJsonData()/key2:", key);
          this.logger.logDebug("BaseService::updateJsonData()/target:", target);
          if (!Object.prototype.hasOwnProperty.call(target, key)) {
            this.err.push(`Path error: Key '${key}' does not exist.`);
            return null;
          }
          target = target[key];
        }
      }

      // Set the value at the target node
      const finalKey = jsonUpdate.path[pathLength - 1];
      this.logger.logDebug(
        "BaseService::updateJsonData()/finalKey1:",
        finalKey
      );
      if (finalKey.startsWith("[") && finalKey.endsWith("]")) {
        this.logger.logDebug(
          "BaseService::updateJsonData()/finalKey2:",
          finalKey
        );
        const index = parseInt(finalKey.slice(1, -1), 10);
        if (isNaN(index) || !Array.isArray(target)) {
          this.err.push(
            `Invalid path at final key '${finalKey}': Expected a valid array index in an array.`
          );
          return null;
        }
        this.logger.logDebug("BaseService::updateJsonData()/target2:", target);
        target[index] = jsonUpdate.value; // Update the value at the specified index
      } else {
        this.logger.logDebug(
          "BaseService::updateJsonData()/jsonUpdate.value:",
          jsonUpdate.value
        );
        this.logger.logDebug("BaseService::updateJsonData()/target3:", target);
        this.logger.logDebug(
          "BaseService::updateJsonData()/finalKey3:",
          finalKey
        );
        target[finalKey] = jsonUpdate.value; // Update the value at the specified key
      }

      this.logger.logDebug(
        "BaseService::updateJsonData()/jsonData3:",
        jsonData
      );
      return jsonData; // Return the updated JSON data
    } catch (e) {
      // Catch unexpected errors and log them
      this.err.push(e.toString());
      return null;
    }
  }

  initCdResp(): ICdResponse {
    return {
      app_state: {
        success: false,
        info: {
          messages: [],
          code: "",
          app_msg: "",
          respState: {
            cdLevel: null,
            cdDescription: null,
            httpCode: null,
            httpDescription: null,
          },
        },
        sess: {
          cd_token: this.getGuid(),
          jwt: null,
          ttl: 0,
        },
        cache: {},
        sConfig: {
          usePush: config.usePolling,
          usePolling: config.usePush,
          useCacheStore: config.useCacheStore,
        },
      },
      data: null,
    };
  }

  // async respond(req, res) {
  //   this.logger.logDebug("**********starting respond(res)*********");
  //   // res.status(200).json(this.cdResp);
  //   let ret;
  //   try {
  //     this.logger.logDebug("BaseService::respond(res)/this.pl:", {
  //       post: req.post,
  //     });
  //     this.logger.logDebug("BaseService::respond(res)/this.cdResp:", {
  //       cdResp: this.cdResp,
  //     });
  //     ret = res.status(200).json(this.cdResp);
  //   } catch (e) {
  //     this.err.push(e.toString());
  //   }
  //   return ret;
  // }

  async respond(req, res) {
    this.logger.logDebug("**********starting respond(res)*********");
    let ret;
    try {
      this.logger.logDebug("BaseService::respond(res)/this.pl:", {
        post: req.post,
      });
      this.logger.logDebug("BaseService::respond(res)/this.cdResp:", {
        cdResp: this.cdResp,
      });

      const finalResp = await this.preFlight(req, res);
      ret = res.status(200).json(finalResp);
    } catch (e) {
      this.err.push(e.toString());
    }
    return ret;
  }

  // async preFlight(req, res) {
  //   this.logger.logDebug("**********starting preFlight(res)*********");

  //   this.logger.logDebug(`BaseService::getPlData()/this.cdResp:${this.cdResp}`);

  //   // Safely stringify the response and check for circular references
  //   let safeResp = JsonHelper.safeStringify(this.cdResp);

  //   // Detect if [Circular] marker exists
  //   if (safeResp.includes("[Circular]")) {
  //     const warningMsg =
  //       "[WARNING]: This response had circular anomaly and has been truncated. See areas marked with [Circular].";

  //     // Parse the response and add the warning message
  //     let safeRespJson: ICdResponse = JSON.parse(safeResp);

  //     // Ensure the app_msg and messages properties exist
  //     const appStateInfo = safeRespJson.app_state?.info;
  //     if (!appStateInfo.app_msg) {
  //       appStateInfo.app_msg = "";
  //     }
  //     if (!Array.isArray(appStateInfo.messages)) {
  //       appStateInfo.messages = [];
  //     }

  //     // Accumulate the warning messages
  //     appStateInfo.app_msg += `; ${warningMsg}`;
  //     appStateInfo.messages.push(warningMsg);
  //     appStateInfo.respState.cdLevel = CdResponseState.WARNING;
  //     appStateInfo.respState.httpCode = HttpState.ACCEPTED

  //     // Update the response object
  //     safeRespJson.app_state.info = appStateInfo;

  //     // Stringify the modified object
  //     safeResp = JSON.stringify(safeRespJson);

  //     // Log the warning
  //     this.logger.logWarn(warningMsg);
  //   }

  //   // Return the final response (JSON parsed again)
  //   return JSON.parse(safeResp);
  // }

  async preFlight(req, res) {
    this.logger.logDebug("**********starting preFlight(res)*********");
    this.logger.logDebug(
      `BaseService::getPlData()/this.cdResp:`,
      JSON.stringify(this.cdResp)
    );

    // Step 1: Sanitize the cdResp data safely
    const sanitizedCdResp = this.deepSanitize(this.cdResp);
    // Step 2: Safely stringify the sanitized response
    let safeResp = JsonHelper.safeStringify(sanitizedCdResp);
    // Step 3: Detect if [Circular] marker exists
    if (safeResp.includes("[Circular]")) {
      try {
        safeResp = this.setCircularError(safeResp);
      } catch (e) {
        this.logger.logWarn("An attempt to set error condition failed");
        this.logger.logError(e.toString());
      }
    }
    this.logger.logDebug(`BaseService::getPlData()/15`);

    // Return the final response (JSON parsed again)
    return JSON.parse(safeResp);
  }

  setCircularError(safeResp: string){
    this.logger.logDebug(`BaseService::setCircularError()/01`);
    const warningMsg =
      "[WARNING]: This response had circular anomaly and has been truncated. See areas marked with [Circular].";

    // Parse the response and add the warning message
    let safeRespJson: ICdResponse = JSON.parse(safeResp);
    // Ensure the app_msg and messages properties exist
    const appStateInfo = safeRespJson.app_state?.info;
    if (!appStateInfo.app_msg) {
      appStateInfo.app_msg = "";
    }
    if (!Array.isArray(appStateInfo.messages)) {
      appStateInfo.messages = [];
    }
    // Accumulate the warning messages
    appStateInfo.app_msg += `; ${warningMsg}`;
    appStateInfo.messages.push(warningMsg);
    appStateInfo.respState.cdLevel = CdResponseState.WARNING;
    appStateInfo.respState.httpCode = HttpState.ACCEPTED;
    // Update the response object
    safeRespJson.app_state.info = appStateInfo;
    // Stringify the modified object
    safeResp = JSON.stringify(safeRespJson);
    // Log the warning
    this.logger.logWarn(warningMsg);
    return safeResp
  }

  private deepSanitize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepSanitize(item));
    } else if (obj !== null && typeof obj === "object") {
      // If it's a TypeORM entity or a class instance, transform it
      if (
        typeof obj.constructor === "function" &&
        obj.constructor.name !== "Object"
      ) {
        try {
          return instanceToPlain(obj);
        } catch (e) {
          // If instanceToPlain fails for some reason, fallback to copying plain properties
          const plainObj = {};
          for (const key in obj) {
            plainObj[key] = this.deepSanitize(obj[key]);
          }
          return plainObj;
        }
      } else {
        // Pure JSON object (not an instance), process normally
        const newObj = {};
        for (const key in obj) {
          newObj[key] = this.deepSanitize(obj[key]);
        }
        return newObj;
      }
    } else {
      // Primitive (string, number, boolean, null, undefined)
      return obj;
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param result
   * @param iCode
   */
  successResponse(req, res, result, appMsg = null) {
    if (appMsg) {
      this.i.app_msg = appMsg;
    }
    const svSess = new SessionService();
    svSess.sessResp.cd_token = req.post.dat.token;
    svSess.sessResp.ttl = svSess.getTtl();
    this.setAppState(true, this.i, svSess.sessResp);
    this.cdResp.data = result;
    this.respond(req, res);
  }

  /**
   *
   * @param req
   * @param extData // used to target any property of 'f_vals' other than 'data'
   * @param fValsIndex // used if f_val items are multiple
   * @returns
   */
  getPlData(
    req,
    extData: string | null = null,
    fValsIndex: number | null = null
  ) {
    this.logger.logDebug("BaseService::getPlData()/01");
    this.logger.logDebug(`BaseService::getPlData()/extData1:${extData}`);
    let ret = null;
    const svSess = new SessionService();
    if (this.validatePlData(req, extData)) {
      try {
        if (extData) {
          this.logger.logDebug("BaseService::getPlData()/02");
          this.logger.logDebug(
            `BaseService::getPlData()/fValsIndex:${fValsIndex}`
          );
          this.logger.logDebug(
            `BaseService::getPlData()/req.post.dat.f_vals[0]:${JSON.stringify(
              req.post.dat.f_vals[0]
            )}`
          );
          if (fValsIndex) {
            ret = req.post.dat.f_vals[fValsIndex][extData];
          } else {
            ret = req.post.dat.f_vals[0][extData];
          }
        } else {
          this.logger.logDebug("BaseService::getPlData()/03");
          if (fValsIndex) {
            ret = req.post.dat.f_vals[fValsIndex].data;
          } else {
            ret = req.post.dat.f_vals[0].data;
          }
        }
        this.logger.logDebug("BaseService::getPlData()/04");
        this.logger.logDebug("BaseService::getData()/ret:", ret);
        return ret;
      } catch (e) {
        this.setAlertMessage(e.toString(), svSess, false);
        return {};
      }
    } else {
      this.setAlertMessage("invalid validation request", svSess, false);
      return {};
    }
  }

  getPlQuery(
    req,
    extData: string | null = null,
    fValsIndex: number | null = null
  ) {
    this.logger.logDebug("BaseService::getPlQuery()/01");
    let ret = null;
    const svSess = new SessionService();
    if (this.validatePlData(req, extData)) {
      try {
        if (extData) {
          this.logger.logDebug("BaseService::getPlQuery()/02");
          if (fValsIndex) {
            ret = req.post.dat.f_vals[fValsIndex][extData];
          } else {
            ret = req.post.dat.f_vals[0][extData];
          }
        } else {
          this.logger.logDebug("BaseService::getPlQuery()/03");
          if (fValsIndex) {
            ret = req.post.dat.f_vals[fValsIndex].query;
          } else {
            ret = req.post.dat.f_vals[0].query;
          }
        }
        this.logger.logDebug("BaseService::getPlQuery()/04");
        this.logger.logDebug("BaseService::getQuery()/ret:", ret);
        return ret;
      } catch (e) {
        this.setAlertMessage(e.toString(), svSess, false);
        return {};
      }
    } else {
      this.setAlertMessage("invalid validation request", svSess, false);
      return {};
    }
  }

  async setPlData(
    req,
    item: ObjectItem,
    extData: string = null
  ): Promise<void> {
    this.logger.logDebug("BaseService::setPlData()/item:", item);
    if (extData) {
      this.logger.logDebug("BaseService::setPlData()/extData:", {
        extData: extData,
      });
      this.logger.logDebug(
        "BaseService::setPlData()/req.post.dat.f_vals[0][extData]:",
        req.post.dat.f_vals[0][extData]
      );
      req.post.dat.f_vals[0][extData][item.key] = item.value;
    } else {
      req.post.dat.f_vals[0].data[item.key] = item.value;
    }
    this.logger.logDebug(
      "BaseService::setPlData()/req.post.dat.f_vals[0]:",
      req.post.dat.f_vals[0]
    );
  }

  /**
   *
   * @param req
   * @param item
   * @param extData
   */
  async setPlDataM(
    req,
    data: any,
    item: ObjectItem,
    extData: string = null
  ): Promise<void> {
    this.logger.logDebug("BaseService::setPlDataM()/item:", item);
    if (extData) {
      this.logger.logDebug("BaseService::setPlDataM()/extData:", {
        context: extData,
      });
      this.logger.logDebug("BaseService::setPlDataM()/data:", data[extData]);
      data[extData][item.key] = item.value;
    }
    this.logger.logDebug("BaseService::setPlDataM()/data:", data);
  }

  /**
   * prevent a situation where either
   * 'data' property is missing or
   * extData property is missing
   * @param req
   * @param res
   * @param extData
   */
  async validatePlData(req, extData) {
    const svSess = new SessionService();
    let ret = false;
    if (extData) {
      if (extData in req.post.dat.f_vals[0]) {
        ret = true;
      } else {
        this.setAlertMessage(
          "BaseService::validatePlData/requested property is missing",
          svSess,
          false
        );
      }
    } else {
      if ("data" in req.post.dat.f_vals[0]) {
        ret = true;
      } else {
        this.setAlertMessage(
          "BaseService::validatePlData/requested property is missing",
          svSess,
          false
        );
      }
    }
  }

  getReqToken(req) {
    const r: ICdRequest = req.post;
    return r.dat.token;
  }

  // getPlQuery(req, extData = null): Promise<any> {
  //     if (extData) {
  //         return req.post.dat.f_vals[0][extData];
  //     } else {
  //         return req.post.dat.f_vals[0].data;
  //     }
  // }

  async setCreateIData(
    req,
    controllerData: ICdRequest,
    item: ObjectItem
  ): Promise<ICdRequest> {
    // this.logger.logDebug('BaseService::setCreateIData()/item:', item);
    // this.logger.logDebug('BaseService::setCreateIData()/controllerData(1):', controllerData);
    controllerData[item.key] = item.value;
    // this.logger.logDebug('BaseService::setCreateIData()/controllerData(2):', controllerData);
    return await controllerData;
  }

  getQuery(req) {
    this.logger.logDebug("BaseService::getQuery()/01");
    this.logger.logDebug(
      `BaseService::getQuery()/req.post.dat.f_vals[0].query:${JSON.stringify(
        req.post.dat.f_vals[0].query
      )}`
    );
    const q = req.post.dat.f_vals[0].query;
    this.logger.logDebug(`BaseService::getQuery()/q:${q}`);
    this.pl = req.post;
    if (q) {
      return q;
    } else {
      return {};
    }
  }

  async getEntityPropertyMap(req, res, model) {
    await this.init(req, res);
    // this.logger.logDebug('BaseService::getEntityPropertyMap()/model:', model)
    const entityMetadata: EntityMetadata = await this.ds.getMetadata(model);
    // this.logger.logDebug('BaseService::getEntityPropertyMap()/entityMetadata:', entityMetadata)
    const cols = await entityMetadata.columns;
    const colsFiltd = await cols.map(async (col) => {
      return await {
        propertyAliasName: col.propertyAliasName,
        databaseNameWithoutPrefixes: col.databaseNameWithoutPrefixes,
        type: col.type,
      };
    });
    return colsFiltd;
  }

  async getEntityPropertyMapSL(req, res, model) {
    await this.initSqlite(req, res);
    const entityMetadata: EntityMetadata = await this.ds.getMetadata(model);
    const cols = await entityMetadata.columns;
    // this.logger.logDebug('BaseService::getEntityPropertyMapSL()/cols:', cols)
    const colsFiltdArr = [];
    const colsFiltd = await cols.map(async (col) => {
      const ret = {
        propertyAliasName: await col.propertyAliasName,
        databaseNameWithoutPrefixes: await col.databaseNameWithoutPrefixes,
        type: await col.type,
      };
      // this.logger.logDebug('getEntityPropertyMapSL()/ret:', {ret: JSON.stringify(ret)});
      colsFiltdArr.push(ret);
      return ret;
    });
    // this.logger.logDebug('BaseService::getEntityPropertyMapSL()/colsFiltd:', await colsFiltd)
    // this.logger.logDebug('BaseService::getEntityPropertyMapSL()/colsFiltdArr:', await colsFiltdArr)
    return colsFiltdArr;
  }

  async validateUnique(req, res, params) {
    this.logger.logDebug("BaseService::validateUnique()/01");
    this.logger.logDebug("BaseService::validateUnique()/req.post:", {
      reqPost: JSON.stringify(req.post),
    });
    // this.logger.logDebug('BaseService::validateUnique()/req.post.dat.f_vals[0]:', req.post.dat.f_vals[0])
    this.logger.logDebug("BaseService::validateUnique()/params:", params);
    await this.init(req, res);
    // assign payload data to this.userModel
    //** */ params.controllerInstance.userModel = this.getPlData(req);
    // set connection
    // const baseRepository = this.db.getConnection().getRepository(params.model);
    const baseRepository = this.ds.getRepository(params.model);
    this.logger.logDebug("BaseService::validateUnique()/repo/model:", {
      model: params.model,
    });
    // const baseRepository: any = await this.repo(req, res, params.model)
    // const baseRepository: any = await this.repo
    // get model properties
    const propMap = await this.getEntityPropertyMap(
      req,
      res,
      params.model
    ).then((result) => {
      // this.logger.logDebug('validateUnique()/result:', result)
      return result;
    });
    // this.logger.logDebug('validateUnique()/propMap:', await propMap)
    // const strQueryItems = await this.getQueryItems(req, propMap, params)
    const strQueryItems = await this.getQueryItems(req, params);
    this.logger.logDebug(
      "BaseService::validateUnique()/strQueryItems:",
      strQueryItems
    );
    // convert the string items into JSON objects
    // const arrQueryItems = await strQueryItems.map(async (item) => {
    //     this.logger.logDebug('validateUnique()/item:', await item)
    //     return await JSON.parse(item);
    // });

    // this.logger.logDebug('validateUnique()/arrQueryItems:', arrQueryItems)
    // const filterItems = await JSON.parse(strQueryItems)
    const filterItems = await strQueryItems;
    this.logger.logDebug(
      "BaseService::validateUnique()/filterItems:",
      filterItems
    );
    // execute the query
    const results = await baseRepository.count({
      where: await filterItems,
    });
    this.logger.logDebug("BaseService::validateUnique()/results:", {
      result: results,
    });
    // return boolean result
    let ret = false;
    if (results === 0) {
      ret = true;
    } else {
      this.err.push("duplicate not allowed");
      // this.logger.logDebug('BaseService::create()/Error:', e.toString())
      const i = {
        messages: this.err,
        code: "BaseService:validateUnique",
        app_msg: "",
      };
      await this.setAppState(false, i, null);
    }
    this.logger.logDebug("BaseService::validateUnique()/ret:", { return: ret });
    return ret;
  }

  // async getQueryItems(req, propMap: any[], params: any) {
  async getQueryItems(req, params, fields = null) {
    this.logger.logDebug("BaseService::getQueryItems()/01");
    ////////////////////////////////////////////////
    this.logger.logDebug("BaseService::getQueryItems()/params:", params);
    this.logger.logDebug(
      "BaseService::getQueryItems()/req.post.dat.f_vals[0].data:",
      req.post.dat.f_vals[0].data
    );
    this.logger.logDebug("BaseService::getQueryItems()/02");
    if (fields === null) {
      fields = req.post.dat.f_vals[0].data;
    }
    this.logger.logDebug("BaseService::getQueryItems()/03");
    const entries = Object.entries(fields);
    this.logger.logDebug("BaseService::getQueryItems()/04");
    this.logger.logDebug("getQueryItems()/entries:", entries);
    const entryObjArr = entries.map((e) => {
      this.logger.logDebug("getQueryItems()/e:", e);
      const k = e[0];
      const v = e[1];
      const ret = JSON.parse(
        `[{"key":"${k}","val":"${v}","obj":{"${k}":"${v}"}}]`
      );
      this.logger.logDebug("getQueryItems()/ret:", ret);
      return ret;
    });
    this.logger.logDebug("getQueryItems()/entryObjArr:", entryObjArr);
    const cRules: string[] = params.controllerInstance.cRules.noDuplicate;
    const qItems = entryObjArr.filter((f) => this.isNoDuplicate(f, cRules));
    this.logger.logDebug("getQueryItems()/qItems:", qItems);
    const result: any = {};
    qItems.forEach(async (f: any) => {
      result[f[0].key] = f[0].val;
    });
    return await result;
  }

  /**
   * filter mapping for no-duplicate-fields
   * - the result is used in validateUnique(req, res, params)
   * to query existence of duplicate entries
   * @param name
   * @param alias
   * @param cRules
   * @returns
   */
  async isNoDuplicateField(name, alias, cRules) {
    const ndFieldNames = cRules.noDuplicate as object[];
    const noDuplicateField = ndFieldNames.filter(
      (fieldName) => alias === fieldName
    );
    let ret = false;
    if (noDuplicateField.length > 0) {
      ret = true;
    } else {
      ret = false;
    }
    return ret;
  }

  isNoDuplicate(fData, cRules = []) {
    // this.logger.logDebug('isNoDuplicate()/cRules:', cRules)
    // this.logger.logDebug('isNoDuplicate()/fData:', fData)
    return cRules.filter((fieldName) => fieldName === fData[0].key).length > 0;
    // this.logger.logDebug('isNoDuplicate()/field:', dupFields)
    // let ret = false;
    // if (dupFields.length > 0) {
    //     ret = true;
    // } else {
    //     ret = false;
    // }
    // return ret;
  }

  async validateRequired(req, res, cRules) {
    this.logger.logDebug(
      "BaseService::validateRequired()/cRules:",
      JSON.stringify(cRules)
    );
    const svSess = new SessionService();
    await this.init(req, res);
    const rqFieldNames = cRules.required as string[];
    this.logger.logDebug(
      "BaseService::validateRequired()/rqFieldNames:",
      JSON.stringify(rqFieldNames)
    );
    this.isInvalidFields = await rqFieldNames.filter((fieldName) => {
      this.logger.logDebug(
        "BaseService::validateRequired()/fieldName:",
        fieldName
      );
      this.logger.logDebug(
        "BaseService::validateRequired()/this.getPlData(req):",
        JSON.stringify(this.getPlData(req))
      );
      if (!(fieldName in this.getPlData(req))) {
        // required field is missing
        return fieldName;
      }
    });
    if (this.isInvalidFields.length > 0) {
      // this.logger.logDebug('BaseService::validateRequired()/cRules:', JSON.stringify(cRules))
      // this.logger.logDebug('BaseService::validateRequired()/isInvalid:', JSON.stringify(this.isInvalidFields))
      this.i.app_msg = `the required fields ${this.isInvalidFields.join(
        ", "
      )} is missing`;
      this.i.messages.push(this.i.app_msg);
      this.setAppState(false, this.i, svSess.sessResp);
      return false;
    } else {
      return true;
    }
  }

  async validateRequiredI(req, res, params: CreateIParams) {
    const cRules = params.serviceInput.serviceInstance.cRules;
    this.logger.logDebug(
      "BaseService::validateRequired()/cRules:",
      JSON.stringify(cRules)
    );
    const svSess = new SessionService();
    await this.init(req, res);
    const rqFieldNames = cRules.required as string[];
    this.logger.logDebug(
      "BaseService::validateRequired()/rqFieldNames:",
      JSON.stringify(rqFieldNames)
    );
    this.isInvalidFields = await rqFieldNames.filter((fieldName) => {
      this.logger.logDebug(
        "BaseService::validateRequired()/fieldName:",
        fieldName
      );
      this.logger.logDebug(
        "BaseService::validateRequired()/params.controllerData:",
        JSON.stringify(params.controllerData)
      );
      if (!(fieldName in params.controllerData)) {
        // required field is missing
        return fieldName;
      }
    });
    if (this.isInvalidFields.length > 0) {
      // this.logger.logDebug('BaseService::validateRequired()/cRules:', JSON.stringify(cRules))
      // this.logger.logDebug('BaseService::validateRequired()/isInvalid:', JSON.stringify(this.isInvalidFields))
      this.i.app_msg = `the required fields ${this.isInvalidFields.join(
        ", "
      )} is missing`;
      this.i.messages.push(this.i.app_msg);
      this.setAppState(false, this.i, svSess.sessResp);
      return false;
    } else {
      return true;
    }
  }

  async validateUniqueI(req, res, params: CreateIParams) {
    this.logger.logDebug("BaseService::validateUniqueI()/01");
    this.logger.logDebug("BaseService::validateUniqueI()/req.post:", req.post);
    this.logger.logDebug(
      "BaseService::validateUniqueI()/req.post.dat.f_vals[0]:",
      req.post.dat.f_vals[0]
    );
    this.logger.logDebug("BaseService::validateUniqueI()/params:", params);
    await this.init(req, res);
    // assign payload data to this.userModel
    //** */ params.controllerInstance.userModel = this.getPlData(req);
    // set connection
    const baseRepository = this.ds.getRepository(
      params.serviceInput.serviceModel
    );
    this.logger.logDebug("BaseService::validateUniqueI()/repo/model:", {
      model: params.serviceInput.serviceModel,
    });

    this.logger.logDebug(
      "BaseService::validateUniqueI()/params.serviceInput:",
      params.serviceInput
    );
    // const filterItems = await JSON.parse(strQueryItems)
    const filterItems = await this.duplicateFilter(
      params.controllerData,
      params.serviceInput.serviceInstance.cRules.noDuplicate
    );
    this.logger.logDebug(
      "BaseService::validateUniqueI()/filterItems:",
      filterItems
    );
    // execute the query
    const results = await baseRepository.count({
      where: await filterItems,
    });
    this.logger.logDebug("BaseService::validateUniqueI()/results:", results);
    // return boolean result
    let ret = false;
    if (results === 0) {
      ret = true;
    } else {
      this.err.push("duplicate not allowed");
      // this.logger.logDebug('BaseService::create()/Error:', e.toString())
      const i = {
        messages: this.err,
        code: "BaseService:validateUniqueI",
        app_msg: "",
      };
      await this.setAppState(false, i, null);
    }
    this.logger.logDebug("BaseService::validateUniqueI()/ret:", {
      return: ret,
    });
    return ret;
  }

  async duplicateFilter<T extends Record<string, any>>(
    controllerData: T,
    noDuplicate: string[]
  ): Promise<Partial<T>> {
    this.logger.logDebug(
      "BaseService::duplicateFilter()/controllerData:",
      controllerData
    );
    this.logger.logDebug(
      "BaseService::duplicateFilter()/noDuplicate:",
      noDuplicate
    );
    const filteredData = {} as Partial<T>;

    for (const field of noDuplicate) {
      if (Object.prototype.hasOwnProperty.call(controllerData, field)) {
        (filteredData as Record<string, any>)[field] = controllerData[field];
      }
    }

    return filteredData;
  }

  /**
   * 1. create new doc
   * 2. use docId to complete create
   * 3. for any error, save the error using serviceErr()
   *    process is expected to return the encountered errors back to requesting entity
   * 4. Returning data is encpsulated in corpdesk http request object this.cdResp.
   *
   * used where create is called remotely
   * Note that both create() and createI(), are processed together with
   * doc data: containing dates, user and other application information
   * used in document tracking
   * @param req
   * @param res
   * @param serviceInput
   * @returns
   */
  async create(req, res, serviceInput: IServiceInput) {
    /**
     * Initialize the repo
     */
    await this.init(req, res);
    this.setRepo(serviceInput);

    /**
     * Doc is the component that saves meta data of create tranaction
     * Create a Doc associated with this insertion
     */
    let newDocData;
    try {
      newDocData = await this.saveDoc(req, res, serviceInput);
    } catch (e) {
      this.serviceErr(req, res, e, "BaseService:create/savDoc");
    }

    /**
     * pass this.repo to serviceRepository
     */
    let serviceRepository = null;
    try {
      serviceRepository = await this.repo;
    } catch (e) {
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:create/getConnection",
        app_msg: "",
      };
      await this.serviceErr(req, res, e, "BaseService:create");
      return this.cdResp;
    }

    /**
     * use the Doc data to create a new object based on the model
     */
    try {
      let modelInstance = serviceInput.serviceModelInstance;
      if ("dSource" in serviceInput) {
        if (serviceInput.dSource === 1) {
          await this.setPlData(req, {
            key: "docId",
            value: await newDocData.docId,
          }); // set docId
          const serviceData = await this.getServiceData(req, serviceInput);
          modelInstance = await this.setEntity(
            req,
            res,
            serviceInput,
            serviceData
          );
          this.logger.logDebug("BaseService::create()/11");
          return await serviceRepository.save(await modelInstance);
        }
      }
    } catch (e) {
      const i = {
        messages: this.err,
        code: "BaseService:create",
        app_msg: "",
      };
      await this.setAppState(false, i, null);
      await this.serviceErr(req, res, e, "BaseService:create");
    }
  }

  async createSL(req, res, serviceInput: IServiceInput) {
    try {
      const repo: any = await this.sqliteConn.getRepository(
        serviceInput.serviceModel
      );
      const pl = this.getPlData(req);
      return await repo.save(pl);
    } catch (e) {
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BillService:create",
        app_msg: "",
      };
      await this.serviceErr(req, res, e, "BillService:create");
      return this.cdResp;
    }
  }

  /**
   * similar to create() but
   * used where create is called internally
   * Note that both create and createI, are tagged with
   * doc data which has dates, user and other application information
   * used in document tracking
   * @param req
   * @param res
   * @param createIParams
   */
  async createI(req, res, createIParams: CreateIParams): Promise<any> {
    this.logger.logDebug("BaseService::createI()/01");
    await this.init(req, res);
    let newDocData;
    let ret: any;
    try {
      this.logger.logDebug("BaseService::createI()/02");
      newDocData = await this.saveDoc(req, res, createIParams.serviceInput);
      // this.logger.logDebug('BaseService::createI()/newDocData:', newDocData)
    } catch (e) {
      this.logger.logDebug("BaseService::createI()/03");
      this.serviceErr(req, res, e, "BaseService:createI()/savDoc");
    }
    let serviceRepository = null;
    try {
      this.logger.logDebug("BaseService::createI()/04");
      serviceRepository = await this.ds.getRepository(
        createIParams.serviceInput.serviceModel
      );
      this.logger.logDebug(
        "BaseService::createI()/repo/model:",
        createIParams.serviceInput.serviceModel
      );
    } catch (e) {
      this.logger.logDebug("BaseService::createI()/05");
      this.logger.logDebug("BaseService::createI()/Error/01");
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:create/getConnection",
        app_msg: "problem creating connection",
      };
      this.logger.logDebug("BaseService::createI()/06");
      await this.serviceErr(req, res, e, "BaseService:create/getConnection");
      return this.cdResp;
    }

    try {
      this.logger.logDebug("BaseService::createI()/07");
      let modelInstance = createIParams.serviceInput.serviceModelInstance;
      if ("dSource" in createIParams.serviceInput) {
        this.logger.logDebug("BaseService::createI()/08");
        if (createIParams.serviceInput.dSource === 1) {
          this.logger.logDebug("BaseService::createI()/09");
          this.logger.logDebug(
            "BaseService::createI()/newDocData:",
            newDocData
          );
          this.logger.logDebug(
            "BaseService::createI()/createIParams:",
            createIParams
          );
          this.logger.logDebug(
            "BaseService::createI()/createIParams.controllerData:",
            createIParams.controllerData
          );
          createIParams.controllerData = await this.setCreateIData(
            req,
            createIParams.controllerData,
            { key: "docId", value: await newDocData.docId }
          );
          this.logger.logDebug("BaseService::createI()/091");
          const serviceData = createIParams.controllerData;
          this.logger.logDebug("BaseService::createI()/092");
          modelInstance = await this.setEntity(
            req,
            res,
            createIParams.serviceInput,
            serviceData
          );
          // modelInstance = createIParams.serviceInput.serviceModelInstance
          this.logger.logDebug("BaseService::createI()/093");
          // serviceRepository = await this.repo
          this.logger.logDebug("BaseService::createI()/094");
          ret = await serviceRepository.save(await modelInstance);
        }
      }
    } catch (e) {
      this.logger.logDebug("BaseService::createI()/10");
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:createI",
        app_msg: "problem saving data",
      };
      await this.serviceErr(req, res, e, "BaseService:createI");
      ret = false;
    }
    this.logger.logDebug("BaseService::createI()/11");
    return await ret;
  }

  async saveDoc(req, res, serviceInput: IServiceInput) {
    await this.init(req, res);

    this.logger.logDebug("BaseService::saveDoc()/01");
    // const docRepository: any = await this.ds.getRepository(DocModel);
    this.logger.logDebug("BaseService::saveDoc()/repo/model:", DocModel);
    // const docRepository: any = await this.repo(req, res, DocModel)

    this.logger.logDebug("BaseService::saveDoc()/02");
    const doc = await this.setDoc(req, res, serviceInput);
    this.logger.logDebug("BaseService::saveDoc()/03/dod:", doc);
    this.logger.logDebug("BaseService::saveDoc()/doc:", doc);
    // await this.setRepo(serviceInput)

    // const docRepository: any = this.repo
    return await this.docRepository.save(doc);
  }

  async addParam(req, param) {
    return { ...req.post.dat.f_vals[0].data, ...param }; // merge objects
  }

  async setDoc(req, res, serviceInput) {
    this.logger.logDebug("BaseService::setDoc()/01");
    if (!this.cdToken) {
      this.logger.logDebug("BaseService::setDoc()/02");
      await this.setSess(req, res);
    }
    this.logger.logDebug("BaseService::setDoc()/03");
    const dm: DocModel = new DocModel();
    const iDoc = new DocService();
    dm.docFrom = this.cuid;
    dm.docName = serviceInput.docName;
    this.logger.logDebug("BaseService::setDoc()/04");
    dm.docTypeId = await iDoc.getDocTypeId(req, res);
    this.logger.logDebug("BaseService::setDoc()/05");
    dm.docDate = await this.mysqlNow();
    this.logger.logDebug("BaseService::setDoc()/06");
    const AppDataSource = await getDataSource();
    this.docRepository = AppDataSource.getRepository(DocModel);
    return await dm;
  }

  async setSess(req, res) {
    this.logger.logDebug("BaseService::setSess()/01");
    this.svSess = new SessionService();
    if (await !this.cdToken) {
      this.logger.logDebug("BaseService::setSess()/02");
      try {
        this.logger.logDebug("BaseService::setSess()/req.post:", req.post);
        if ("sessData" in req.post) {
          this.logger.logDebug("BaseService::setSess()/021");
          this.logger.logDebug(
            "BaseService::setSess()/req.post.sessData:",
            req.post.sessData
          );
          this.sess = [req.post.sessData];
        } else {
          this.logger.logDebug("BaseService::setSess()/022");
          this.sess = await this.svSess.getSession(req, res);
        }
        this.logger.logDebug("BaseService::setSess()/03");
        this.logger.logDebug("BaseService::setSess()/this.sess:", this.sess);
        if (this.sess) {
          this.logger.logDebug("BaseService::setSess()/04");
          if (this.sess.length > 0) {
            this.logger.logDebug("BaseService::setSess()/05");
            this.logger.logDebug("this.sess:", this.sess);
            this.setCuid(this.sess[0].currentUserId);
            this.cdToken = await this.sess[0].cdToken;
          } else {
            this.logger.logDebug("BaseService::setSess()/06");
            const noToken = await this.noToken(req, res);
            this.logger.logDebug("BaseService::setSess()/noToken:", {
              noToken: noToken,
            });
            if (noToken === false) {
              this.i = {
                messages: this.err,
                code: "BaseService:setSess1",
                app_msg: "invalid session",
              };
              // do not report 'invalid session' if the session is 'noToken' required.
              await this.serviceErr(req, res, this.i.app_msg, this.i.code);
              // this.respond(req, res);
            }
          }
        } else {
          this.logger.logDebug("BaseService::setSess()/07");
          this.i = {
            messages: this.err,
            code: "BaseService:setSess2",
            app_msg: "invalid session",
          };
          await this.serviceErr(req, res, this.i.app_msg, this.i.code);
          this.respond(req, res);
        }
      } catch (e) {
        this.logger.logDebug("BaseService::setSess()/08");
        this.i = {
          messages: this.err,
          code: "BaseService:setSess3",
          app_msg: e.toString(),
        };
        // await this.serviceErr(req, res, this.i.app_msg, this.i.code)
        await this.setAlertMessage(e.toString(), this.svSess, false);
        // this.respond(req, res);
      }
    }
  }

  async getServiceData(req, serviceInput: IServiceInput) {
    if (serviceInput.data) {
      return await serviceInput.data;
    } else {
      return await this.getPlData(req);
    }
  }

  async setPropertyMapArr(req, res, serviceInput) {
    this.logger.logDebug("BaseService::setPropertyMapArr()/01");
    const propMap = await this.getEntityPropertyMap(
      req,
      res,
      serviceInput.serviceModel
    );
    this.logger.logDebug("BaseService::setPropertyMapArr()/propMap:", propMap);
    const propMapArr = [];
    await propMap.forEach(async (field: any) => {
      // this.logger.logDebug('BaseService::setPropertyMapArr()/forEach/field:', field)
      const f = await field;
      const aName = f.propertyAliasName;
      // this.logger.logDebug('BaseService::setPropertyMapArr()/forEach/aName:', aName)
      const rName = f.databaseNameWithoutPrefixes;
      // this.logger.logDebug('BaseService::setPropertyMapArr()/forEach/rName:', rName)
      propMapArr.push({ alias: aName, fieldName: rName });
    });
    return propMapArr;
  }

  async setEntity(
    req,
    res,
    serviceInput: IServiceInput,
    serviceData: any
  ): Promise<any> {
    // this.logger.logDebug('BaseService::setEntity()/serviceInput:', serviceInput)
    // this.logger.logDebug('BaseService::setEntity()/serviceData:', serviceData)
    const propMapArr = await this.setPropertyMapArr(req, res, serviceInput);
    // this.logger.logDebug('BaseService::setEntity()/propMapArr:', propMapArr)
    const serviceInstance = serviceInput.serviceModelInstance;
    // this.logger.logDebug('BaseService::setEntity()/serviceInstance1:', serviceInstance)
    propMapArr.forEach(async (field: any, i) => {
      // this.logger.logDebug('BaseService::setEntity()/forEach/field:', field)
      serviceInstance[field.alias] = serviceData[field.alias];
    });
    // this.logger.logDebug('BaseService::setEntity()/serviceInstance2:', serviceInstance)
    return await serviceInstance;
  }

  async mysqlNow() {
    this.logger.logDebug("BaseService::mysqlNow()/01");
    const now = new Date();
    const date = await moment(now, "ddd MMM DD YYYY HH:mm:ss");
    this.logger.logDebug("BaseService::mysqlNow()/02");
    const ret = await date.format("YYYY-MM-DD HH:mm:ss"); // convert to mysql date
    this.logger.logDebug("BaseService::mysqlNow()/03");
    return ret;
  }

  getGuid() {
    return uuidv4();
  }

  getCuid(req) {
    return req.post.sessData[0].currentUserId;
  }

  setCuid(cuid: number) {
    this.cuid = cuid;
  }

  async read(req, res, serviceInput: IServiceInput): Promise<any> {
    this.logger.logDebug("BaseService::read()/01");
    await this.init(req, res);
    this.logger.logDebug("BaseService::read()/02");
    this.logger.logDebug("BaseService::read()/serviceInput:", serviceInput);
    // const repo: any = await this.repo(req, res, serviceInput.serviceModel);

    await this.setRepo(serviceInput);

    this.logger.logDebug("BaseService::read()/03");
    let r: any = null;
    switch (serviceInput.cmd.action) {
      case "find":
        try {
          this.logger.logDebug("BaseService::read()/031");
          this.logger.logDebug(
            "BaseService::read()/04/serviceInput.serviceModel:",
            serviceInput.serviceModel
          );
          this.logger.logDebug(
            "BaseService::read()/04/serviceInput.modelName:",
            {
              modelName: serviceInput.modelName,
            }
          );
          await this.setRepo(serviceInput);
          this.logger.logDebug("BaseService::read()/041");
          this.logger.logDebug("BaseService::read()/this.repo:", this.repo);
          r = await this.repo.find(serviceInput.cmd.query);
          // this.logger.logDebug("BaseService::read()/04/r:", r);
          if (serviceInput.extraInfo) {
            this.logger.logDebug("BaseService::read()/05");
            return {
              result: r,
              fieldMap: await this.feildMap(serviceInput),
            };
          } else {
            this.logger.logDebug("BaseService::read()/06");
            return await r;
          }
        } catch (err) {
          this.logger.logDebug("BaseService::read()/07");
          return await this.serviceErr(req, res, err, "BaseService:read");
        }
        break;
      case "count":
        try {
          r = await this.repo.count(serviceInput.cmd.query);
          this.logger.logDebug("BaseService::read()/r:", r);
          return r;
        } catch (err) {
          return await this.serviceErr(req, res, err, "BaseService:read");
        }
        break;
    }

    // this.serviceErr(res, err, 'BaseService:read');
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Read method
  async read2(req: any, res: any, si: IServiceInput): Promise<any> {
    await this.init(req, res);
    // const repo = this.getRepository(si.serviceModel);
    await this.setRepo(si);
    let result;

    switch (si.cmd?.action) {
      case "find":
        result = await this.repo.find(si.cmd.query);
        break;
      case "findOne":
        result = await this.repo.findOne(si.cmd.query);
        break;
      case "queryBuilder":
        const qb = this.repo.createQueryBuilder();
        if (si.cmd.query) {
          // Apply`IQbInput`-style conditions to QueryBuilder
          const { select, where, take, skip } = si.cmd.query as any;
          qb.select(select).where(where);
          if (take) qb.take(take);
          if (skip) qb.skip(skip);
        }
        result = await qb.getMany();
        break;
      default:
        throw new Error(`Unknown action: ${si.cmd?.action}`);
    }

    return result;
  }

  //////////////////////////////////////////////////////////////////////////////

  read$(req, res, serviceInput): Observable<any> {
    return from(this.read(req, res, serviceInput));
  }

  async readCount(req, res, serviceInput): Promise<any> {
    await this.init(req, res);
    this.logger.logDebug(
      "BaseService::readCount()/repo/model:",
      serviceInput.serviceModel
    );
    this.logger.logDebug(
      `BaseService::readCount()/repo/model:${serviceInput.serviceModel}`
    );
    await this.setRepo(serviceInput);
    const repo: any = this.repo;
    try {
      const q: any = this.getQuery(req);
      this.logger.logDebug(`BaseService::readCount()/q:`, q);
      const [result, total] = await repo.findAndCount(q);
      return {
        items: result,
        count: total,
      };
    } catch (err) {
      return await this.serviceErr(req, res, err, "BaseService:readCount");
    }
  }

  readCount$(req, res, serviceInput): Observable<any> {
    this.logger.logDebug(
      "BaseService::readCount$()/serviceInput:",
      serviceInput
    );
    return from(this.readCount(req, res, serviceInput));
  }

  // transformQueryInput(query: QueryInput, queryBuilderHelper): QueryInput {
  //     return {
  //         ...query,
  //         where: queryBuilderHelper.transformWhereClause(query.where),
  //     };
  // }

  /**
   *
   *
   * This method makes use of QueryBuilderHelper to allow query to still be structured as earlier then this
   * class converts them to typeorm query builder.
   */
  // async readQB(req, res, serviceInput: IServiceInput): Promise<any> {
  //   await this.init(req, res);
  //   this.logger.logDebug(
  //     "BaseService::readQB()/repo/model:",
  //     serviceInput.serviceModel
  //   );
  //   await this.setRepo(serviceInput);

  //   // Create the helper instance
  //   const queryBuilderHelper = new QueryBuilderHelper(this.repo);
  //   const repo: any = this.repo;

  //   try {
  //     // let q: any = this.getQuery(req);
  //     // const map = this.entityAdapter.registerMappingFromEntity(serviceInput.serviceModel);

  //     // // clean up the where clause...especially for request from browsers
  //     // const q = this.transformQueryInput(serviceInput.cmd.query, queryBuilderHelper);
  //     // serviceInput.cmd.query.where = q.where;
  //     // this.logger.logDebug(`BaseService::readQB()/q:`, { q: JSON.stringify(q) });
  //     // this.logger.logDebug('BaseService::readQB()/q:', q);

  //     const queryBuilder = queryBuilderHelper.createQueryBuilder(serviceInput);

  //     this.logger.logDebug("BaseService::readQB/sql:", queryBuilder.getSql());
  //     // Fetching items
  //     // const items = await queryBuilder.getMany();
  //     let items = await queryBuilder.getRawMany();
  //     this.logger.logDebug("BaseService::readQB()/items:", items);
  //     const entityName = await this.entityAdapter.getEntityName(
  //       serviceInput.serviceModel
  //     );
  //     items = this.entityAdapter.mapRawToEntity(entityName, items);

  //     this.logger.logDebug("BaseService::readQB()/Fetched-Items:", items); // Debug logging for items

  //     // Fetching count
  //     const count = await queryBuilder.getCount();
  //     this.logger.logDebug("Fetched Count:", count); // Debug logging for count

  //     // Combine results
  //     return {
  //       items,
  //       count,
  //     };
  //   } catch (err) {
  //     console.error("Error in readQB:", err); // Debug logging for errors
  //     return await this.serviceErr(req, res, err, "BaseService:readQB");
  //   }
  // }

  async readQB(req, res, serviceInput: IServiceInput): Promise<any> {
    await this.init(req, res);

    this.logger.logDebug(
      "BaseService::readQB()/repo/model:",
      serviceInput.serviceModel
    );
    await this.setRepo(serviceInput);

    // Ensure the mapping is registered
    await this.entityAdapter.registerMappingFromEntity(
      serviceInput.serviceModel
    );

    // Create the helper instance
    const queryBuilderHelper = new QueryBuilderHelper(this.repo);
    const repo: any = this.repo;

    try {
      const queryBuilder = await queryBuilderHelper.createQueryBuilder(
        serviceInput
      );
      this.logger.logDebug("BaseService::readQB/sql:", queryBuilder.getSql());

      let items = await queryBuilder.getRawMany();
      this.logger.logDebug("BaseService::readQB()/items:", items);

      const entityName = await this.entityAdapter.getEntityName(
        serviceInput.serviceModel
      );
      items = this.entityAdapter.mapRawToEntity(entityName, items);

      this.logger.logDebug("BaseService::readQB()/Fetched-Items:", items);

      const count = await queryBuilder.getCount();
      this.logger.logDebug("Fetched Count:", count);

      return {
        items,
        count,
      };
    } catch (err) {
      console.error("Error in readQB:", err);
      return await this.serviceErr(req, res, err, "BaseService:readQB");
    }
  }

  readQB$(req, res, serviceInput): Observable<any> {
    this.logger.logDebug("BaseService::readQB$()/serviceInput:", serviceInput);
    return from(this.readQB(req, res, serviceInput));
  }

  async readJSONColumnQB(
    req,
    res,
    serviceInput: IServiceInput,
    jsonField: string,
    keys: string[]
  ): Promise<any> {
    await this.init(req, res);
    this.logger.logDebug(
      "BaseService::readJSONColumnQB()/repo/model:",
      serviceInput.serviceModel
    );
    await this.setRepo(serviceInput);

    const queryBuilderHelper = new QueryBuilderHelper(this.repo);
    const queryBuilder = await queryBuilderHelper.createQueryBuilder(
      serviceInput
    );

    // Use MySQL JSON_EXTRACT to extract specific fields from the JSON column
    keys.forEach((key) => {
      queryBuilder.addSelect(
        `JSON_UNQUOTE(JSON_EXTRACT(${jsonField}, '$.${key}'))`,
        key
      );
    });

    try {
      const items = await queryBuilder.getRawMany();
      const entityName = await this.entityAdapter.getEntityName(
        serviceInput.serviceModel
      );
      const processedItems = this.entityAdapter.mapRawToEntity(
        entityName,
        items
      );

      return {
        items: processedItems,
        count: await queryBuilder.getCount(),
      };
    } catch (err) {
      return await this.serviceErr(
        req,
        res,
        err,
        "BaseService:readJSONColumnQB"
      );
    }
  }

  /**
     * 
     * ///////////////////
        const jsonStr = JSON.stringify({
            name: 'test'
        });

        await this.packageEntity.createQueryBuilder()
            .update('package')
            .set({
                patchUrls() {
                    return `JSON_SET(\`patchUrls\`, '$."3-4"', CAST('${jsonStr}' AS JSON))`;
                },
            })
            .where(`id = :id`, { id })
            .execute();
        ////////////////////
     * 
     * @param req 
     * @param res 
     * @param serviceInput 
     * @param jsonField 
     * @param updates 
     * @returns 
     */
  // async updateJSONColumnQB(
  //     req,
  //     res,
  //     serviceInput: IServiceInput,
  //     jsonField: string,
  //     updates: Record<string, any>
  // ): Promise<any> {
  //     await this.init(req, res);
  //     this.logger.logDebug('BaseService::updateJSONColumnQB()/repo/model:', serviceInput.serviceModel);
  //     await this.setRepo(serviceInput);

  //     // Generate the JSON_SET update query for the jsonField
  //     const updateFields = Object.keys(updates)
  //         .map(key => `JSON_SET(${jsonField}, '$.${key}', '${updates[key]}')`)
  //         .join(', ');

  //     this.logger.logDebug("BaseService::updateJSONColumnQB()/updates:", JSON.stringify(updates))
  //     this.logger.logDebug("BaseService::updateJSONColumnQB()/updateFields:", JSON.stringify(updateFields))
  //     // Start building the query using the input provided in serviceInput.cmd.query
  //     const queryBuilder = this.repo.createQueryBuilder()
  //         .update(serviceInput.serviceModel);

  //     // Handle dynamic update fields using the update property from QueryInput
  //     if (serviceInput.cmd.query.update) {
  //         queryBuilder.set(serviceInput.cmd.query.update);
  //     } else {
  //         // Fallback: use the JSON field update if no generic update is provided
  //         queryBuilder.set({ [jsonField]: () => updateFields });
  //     }

  //     // Dynamically handle where conditions from QueryInput or use dynamic primary key
  //     if (serviceInput.cmd.query.where) {
  //         Object.keys(serviceInput.cmd.query.where).forEach(key => {
  //             queryBuilder.andWhere(`${key} = :${key}`, { [key]: serviceInput.cmd.query.where[key] });
  //         });
  //     } else {
  //         // Fallback: Use the primary key based on the service model's convention <controller>_id
  //         const primaryKey = serviceInput.primaryKey; // Dynamically get primary key
  //         queryBuilder.where(`${primaryKey} = :${primaryKey}`, { [primaryKey]: serviceInput.cmd.query[primaryKey] });
  //     }

  //     try {
  //         // Execute the query
  //         return await queryBuilder.execute();
  //     } catch (err) {
  //         return await this.serviceErr(req, res, err, 'BaseService:updateJSONColumnQB');
  //     }
  // }

  // async updateJSONColumn(req, res, serviceInput: IServiceInput): Promise<any> {
  //     await this.init(req, res);
  //     this.logger.logDebug('BaseService::readQB()/repo/model:', serviceInput.serviceModel);
  //     await this.setRepo(serviceInput);

  //     // const userId: number = 1010
  //     // const newProfileData: any = {
  //     //     fieldPermissions: {
  //     //         userPermissions: [{
  //     //             userId: 1000,
  //     //             field: "userName",
  //     //             hidden: false,
  //     //             read: true,
  //     //             write: false,
  //     //             execute: false
  //     //         }],
  //     //         groupPermissions: [{
  //     //             groupId: 0, // "_public"
  //     //             field: "userName",
  //     //             hidden: false,
  //     //             read: true,
  //     //             write: false,
  //     //             execute: false
  //     //         }],
  //     //     },
  //     //     userData: {
  //     //         userName: "",
  //     //         fName: "",
  //     //         lName: "",
  //     //     }
  //     // };
  //     try {
  //         // Use TypeORM's query builder to update the user_profile column
  //         return await this.repo
  //             .createQueryBuilder()
  //             .update(serviceInput.serviceModel)
  //             .set({
  //                 userProfile: JSON.stringify(newProfileData), // This assumes that userProfile is correctly mapped in UserModel
  //             })
  //             .where("user_id = :userId", { userId }) // Replace :userId with the actual ID
  //             .execute();

  //         this.logger.logDebug(`User profile updated for user_id: ${userId}`);
  //     } catch (err) {
  //         // console.error(`Error updating user profile:`, error);
  //         // throw new Error(`Failed to update user profile for user_id: ${userId}`);
  //         return await this.serviceErr(req, res, err, 'BaseService:updateJSONColumn');
  //     }

  // }

  async updateJSONColumnQB(
    req,
    res,
    serviceInput: IServiceInput,
    jsonField: string,
    updates: Record<string, any>
  ): Promise<any> {
    await this.init(req, res);
    this.logger.logDebug(
      "BaseService::updateJSONColumnQB()/repo/model:",
      serviceInput.serviceModel
    );
    await this.setRepo(serviceInput);

    // Helper function to generate JSON_SET paths recursively
    // const buildJsonSetPaths = (jsonField: string, obj: any, prefix: string = ''): string[] => {
    //     return Object.keys(obj).map(key => {
    //         const path = `${prefix}${prefix ? '.' : ''}${key}`;
    //         if (typeof obj[key] === 'object' && obj[key] !== null) {
    //             // Recursively handle nested objects
    //             return buildJsonSetPaths(jsonField, obj[key], path).join(', ');
    //         } else {
    //             return `JSON_SET(${jsonField}, '$.${path}', '${obj[key]}')`;
    //         }
    //     }).filter(Boolean);
    // };
    const buildJsonSetPaths = (
      jsonField: string,
      obj: any,
      prefix: string = ""
    ): string[] => {
      return Object.keys(obj)
        .map((key) => {
          const path = `${prefix}${prefix ? "." : ""}${key}`;
          if (typeof obj[key] === "object" && obj[key] !== null) {
            // Recursively handle nested objects
            return buildJsonSetPaths(jsonField, obj[key], path).join(", ");
          } else {
            // Use COALESCE to ensure JSON is initialized if null
            return `JSON_SET(COALESCE(${jsonField}, '{}'), '$.${path}', '${obj[key]}')`;
          }
        })
        .filter(Boolean);
    };

    // Generate the JSON_SET update query for the jsonField
    const updateFields = buildJsonSetPaths(jsonField, updates).join(", ");

    this.logger.logDebug(
      "BaseService::updateJSONColumnQB()/updates:",
      JSON.stringify(updates)
    );
    this.logger.logDebug(
      "BaseService::updateJSONColumnQB()/updateFields:",
      JSON.stringify(updateFields)
    );

    // Start building the query using the input provided in serviceInput.cmd.query
    const queryBuilder = this.repo
      .createQueryBuilder()
      .update(serviceInput.serviceModel);

    // Handle dynamic update fields using the update property from QueryInput
    if (serviceInput.cmd.query.update) {
      queryBuilder.set(serviceInput.cmd.query.update);
    } else {
      // Fallback: use the JSON field update if no generic update is provided
      queryBuilder.set({ [jsonField]: () => updateFields });
    }

    // Dynamically handle where conditions from QueryInput or use dynamic primary key
    if (serviceInput.cmd.query.where) {
      Object.keys(serviceInput.cmd.query.where).forEach((key) => {
        queryBuilder.andWhere(`${key} = :${key}`, {
          [key]: serviceInput.cmd.query.where[key],
        });
      });
    } else {
      // Fallback: Use the primary key based on the service model's convention <controller>_id
      const primaryKey = serviceInput.primaryKey; // Dynamically get primary key
      queryBuilder.where(`${primaryKey} = :${primaryKey}`, {
        [primaryKey]: serviceInput.cmd.query[primaryKey],
      });
    }

    try {
      // Execute the query
      return await queryBuilder.execute();
    } catch (err) {
      return await this.serviceErr(
        req,
        res,
        err,
        "BaseService:updateJSONColumnQB"
      );
    }
  }

  async deleteJSONColumnFieldQB(
    req,
    res,
    serviceInput: IServiceInput,
    jsonField: string,
    keys: string[]
  ): Promise<any> {
    await this.init(req, res);
    this.logger.logDebug(
      "BaseService::deleteJSONColumnFieldQB()/repo/model:",
      serviceInput.serviceModel
    );
    await this.setRepo(serviceInput);

    // Generate the JSON_REMOVE query for the keys to remove from the jsonField
    const removeFields = keys
      .map((key) => `JSON_REMOVE(${jsonField}, '$.${key}')`)
      .join(", ");

    // Create the query builder and update the JSON field
    const queryBuilder = this.repo.createQueryBuilder();
    queryBuilder
      .update(serviceInput.serviceModel)
      .set({ [jsonField]: () => removeFields })
      .where(`${serviceInput.primaryKey} = :${serviceInput.primaryKey}`, {
        id: serviceInput.cmd.query[serviceInput.primaryKey],
      });

    try {
      // Execute the query
      return await queryBuilder.execute();
    } catch (err) {
      return await this.serviceErr(
        req,
        res,
        err,
        "BaseService:deleteJSONColumnFieldQB"
      );
    }
  }

  // private getPrimaryKey(serviceModel: any): string {
  //     // Assuming the serviceModel's name follows the convention of ending with "Controller"
  //     const modelName = serviceModel.constructor.name.replace('Controller', '').toLowerCase();
  //     return `${modelName}_id`; // e.g., "user_id" for a UserController
  // }

  async readPaged(req, res, serviceInput): Promise<any> {
    await this.init(req, res);
    // const repo = this.ds.getRepository(serviceInput.serviceModel);
    this.logger.logDebug(
      "BaseService::readPaged()/repo/model:",
      serviceInput.serviceModel
    );
    // const repo: any = await this.repo(req, res, serviceInput.serviceModel)
    await this.setRepo(serviceInput);
    // this.setRepo(serviceInput.serviceModel)
    const repo: any = this.repo;
    try {
      const [result, total] = await repo.findAndCount(this.getQuery(req));
      return {
        items: result,
        count: total,
      };
    } catch (err) {
      return await this.serviceErr(req, res, err, "BaseService:readPaged");
    }
  }

  readPaged$(req, res, serviceInput): Observable<any> {
    return from(this.readPaged(req, res, serviceInput));
  }

  async readCountSL(req, res, serviceInput): Promise<any> {
    await this.initSqlite(req, res);
    try {
      // const repo = this.sqliteConn.getRepository(serviceInput.serviceModel);
      await this.setRepo(serviceInput);
      // this.setRepo(serviceInput.serviceModel)
      const repo: any = this.repo;
      const meta = await this.getEntityPropertyMapSL(
        req,
        res,
        serviceInput.serviceModel
      );
      const [result, total] = await repo.findAndCount(this.getQuery(req));
      return {
        metaData: meta,
        items: result,
        count: total,
      };
    } catch (err) {
      return await this.serviceErr(req, res, err, "BaseService:readCount");
    }
  }

  readCountSL$(req, res, serviceInput): Observable<any> {
    return from(this.readCountSL(req, res, serviceInput));
  }

  async feildMap(serviceInput) {
    const meta = this.ds.getMetadata(serviceInput.serviceModel).columns;
    return await meta.map((c) => {
      return {
        propertyPath: c.propertyPath,
        givenDatabaseName: c.givenDatabaseName,
        dType: c.type,
      };
    });
  }

  async feildMapSL(req, res, serviceInput: IServiceInput) {
    await this.initSqlite(req, res);
    // this.logger.logDebug('BaseService::feildMapSL()/this.sqliteConn:', this.sqliteConn)
    this.logger.logDebug(
      "BaseService::feildMapSL()/serviceInput:",
      serviceInput.serviceModel
    );
    const meta = await this.ds.getMetadata(serviceInput.serviceModel).columns;
    return await meta.map(async (c) => {
      return {
        propertyPath: await c.propertyPath,
        givenDatabaseName: await c.givenDatabaseName,
        dType: await c.type,
      };
    });
  }

  async get(req, res, serviceInput: IServiceInput): Promise<any> {
    this.logger.logDebug("BaseService::get/serviceInput:", serviceInput);
    // this.logger.logDebug('BaseService::get/model:', model);
    // const serviceInput: IServiceInput = {
    //     serviceModel: model,
    //     modelName: null,
    //     docName: 'BaseService::get',
    //     cmd: {
    //         action: 'find',
    //         query: q
    //     },
    //     dSource: 1
    // }
    try {
      return await this.read(req, res, serviceInput);
    } catch (e) {
      this.logger.logDebug("BaseService::get()/e:", e);
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:update",
        app_msg: "",
      };
      this.serviceErr(req, res, e, i.code);
      return await new Promise((resolve, reject) => resolve(null));
    }
  }

  get$(req, res, serviceInput: IServiceInput, q: IQuery): Observable<any> {
    this.logger.logDebug("BaseService::get$/q:", q);
    // const serviceInput: IServiceInput = {
    //     serviceModel: model,
    //     docName: 'BaseService::get',
    //     cmd: {
    //         action: 'find',
    //         query: q
    //     },
    //     dSource: 1
    // }
    this.logger.logDebug("BaseService::get$/serviceInput:", serviceInput);
    try {
      return this.read$(req, res, serviceInput);
    } catch (e) {
      this.logger.logDebug("BaseService::read$()/e:", e);
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:get$",
        app_msg: "",
      };
      this.serviceErr(req, res, e, i.code);
      return from(null);
    }
  }

  async readSL(req, res, serviceInput: IServiceInput): Promise<any> {
    try {
      this.initSqlite(req, res);
      // const repo = this.sqliteConn.getRepository(serviceInput.serviceModel);
      await this.setRepo(serviceInput);
      // this.setRepo(serviceInput.serviceModel)
      const repo: any = this.repo;
      const svSess = new SessionService();
      // const billRepository = this.sqliteConn.getRepository(BillModel)
      // const allBills = await billRepository.find()
      // this.logger.logDebug('allBills:', allBills)
      // this.i.app_msg = '';
      // this.setAppState(true, this.i, svSess.sessResp);
      // this.cdResp.data = allBills;
      // const r = await this.respond(req, res);

      let r: any = null;
      switch (serviceInput.cmd.action) {
        case "find":
          try {
            r = await repo.find(serviceInput.cmd.query);
            if (serviceInput.extraInfo) {
              return {
                result: r,
                fieldMap: await this.feildMapSL(req, res, serviceInput),
              };
            } else {
              return await r;
            }
          } catch (err) {
            return await this.serviceErr(req, res, err, "BillService:read");
          }
          break;
        case "count":
          try {
            r = await repo.count(serviceInput.cmd.query);
            this.logger.logDebug("BillService::read()/r:", r);
            return r;
          } catch (err) {
            return await this.serviceErr(req, res, err, "BillService:read");
          }
          break;
      }
      // this.serviceErr(res, err, 'BaseService:read');
    } catch (e) {
      return await this.serviceErr(req, res, e, "BillService:read");
    }
  }

  readSL$(req, res, serviceInput): Observable<any> {
    return from(this.readSL(req, res, serviceInput));
  }

  async update(req, res, serviceInput) {
    let ret: any = [];
    try {
      await this.init(req, res);
      // await this.setRepo(serviceInput.serviceModel)
      await this.setRepo(serviceInput);
      // const serviceRepository = await this.ds.getRepository(serviceInput.serviceModel);
      this.logger.logDebug(
        "BaseService::update()/repo/model:",
        serviceInput.serviceModel
      );
      // const serviceRepository: any = await this.repo(req, res, serviceInput.serviceModel)
      const serviceRepository: any = this.repo;
      const result = await serviceRepository.update(
        serviceInput.cmd.query.where,
        await this.fieldsAdaptor(serviceInput.cmd.query.update, serviceInput)
      );
      if ("affected" in result) {
        this.cdResp.app_state.success = true;
        this.cdResp.app_state.info.app_msg = `${result.affected} record/s updated`;
        ret = result;
      } else {
        this.cdResp.app_state.success = false;
        this.cdResp.app_state.info.app_msg = `some error occorred`;
        if (this.debug) {
          ret = result;
        }
      }
      return ret;
    } catch (e) {
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:update",
        app_msg: "",
      };
      // await this.setAppState(false, i, null);
      await this.serviceErr(req, res, e, i.code);
      return this.cdResp;
    }
  }

  update$(req, res, serviceInput) {
    return from(this.update(req, res, serviceInput));
  }

  async updateSL(req, res, serviceInput: IServiceInput) {
    this.logger.logDebug("BillService::updateSL()/01");
    await this.initSqlite(req, res);
    const svSess = new SessionService();
    // const repo: any = await this.sqliteConn.getRepository(serviceInput.serviceModel);
    // this.setRepo(serviceInput.serviceModel)
    await this.setRepo(serviceInput);
    const repo: any = this.repo;
    const result = await repo.update(
      serviceInput.cmd.query.where,
      await this.fieldsAdaptorSL(
        req,
        res,
        serviceInput.cmd.query.update,
        serviceInput
      )
    );
    this.logger.logDebug("result:", result);
    // this.cdResp.data = ret;
    svSess.sessResp.ttl = svSess.getTtl();
    this.setAppState(true, this.i, svSess.sessResp);
    this.cdResp.data = result;
    this.respond(req, res);
  }

  updateSL$(req, res, serviceInput) {
    return from(this.updateSL(req, res, serviceInput));
  }

  /**
   * this method is used to modify values as desired for
   * acceptance to db.
   * @param fieldsData
   * @param serviceInput
   * @returns
   */
  async fieldsAdaptor(fieldsData: any, serviceInput) {
    // get model properties
    const propMap = await this.feildMap(serviceInput);
    for (const fieldName in fieldsData) {
      if (fieldName) {
        const fieldMapData: any = propMap.filter(
          (f) => f.propertyPath === fieldName
        );

        /**
         * adapt boolean values as desired
         * in the current case, typeorm rejects 1, "1" as boolean so
         * we convert them as desired;
         */
        if (fieldMapData[0]) {
          if (this.fieldIsBoolean(fieldMapData[0].dType)) {
            if (this.isTrueish(fieldsData[fieldName])) {
              fieldsData[fieldName] = true;
            } else {
              fieldsData[fieldName] = false;
            }
          }
        }
      }
    }
    return fieldsData;
  }

  async fieldsAdaptorSL(req, res, fieldsData: any, serviceInput) {
    // get model properties
    const propMap = await this.feildMapSL(req, res, serviceInput);
    for (const fieldName in fieldsData) {
      if (fieldName) {
        const fieldMapData: any = propMap.filter(
          (f: any) => f.propertyPath === fieldName
        );

        /**
         * adapt boolean values as desired
         * in the current case, typeorm rejects 1, "1" as boolean so
         * we convert them as desired;
         */
        if (fieldMapData[0]) {
          if (this.fieldIsBoolean(fieldMapData[0].dType)) {
            if (this.isTrueish(fieldsData[fieldName])) {
              fieldsData[fieldName] = true;
            } else {
              fieldsData[fieldName] = false;
            }
          }
        }
      }
    }
    return fieldsData;
  }

  fieldIsBoolean(fieldType): boolean {
    return fieldType.toString() === "function Boolean() { [native code] }";
  }

  isTrueish(val) {
    let ret = false;
    switch (val) {
      case true:
        ret = true;
        break;
      case "true":
        ret = true;
        break;
      case 1:
        ret = true;
        break;
      case "1":
        ret = true;
        break;
    }
    return ret;
  }

  async delete(req, res, serviceInput) {
    this.logger.logDebug("BaseService::delete()/01");
    let ret: any = [];
    await this.init(req, res);
    await this.setRepo(serviceInput);
    // await this.setRepo(serviceInput.serviceModel)
    // const serviceRepository = await this.ds.getRepository(serviceInput.serviceModel);
    this.logger.logDebug(
      "BaseService::delete()/repo/model:",
      serviceInput.serviceModel
    );
    // const serviceRepository: any = await this.repo(req, res, serviceInput.serviceModel)
    const serviceRepository: any = this.repo;
    const result = await serviceRepository.delete(serviceInput.cmd.query.where);

    if ("affected" in result) {
      this.cdResp.app_state.success = true;
      this.cdResp.app_state.info.app_msg = `${result.affected} record/s deleted`;
      ret = result;
    } else {
      this.cdResp.app_state.success = false;
      this.cdResp.app_state.info.app_msg = `some error occorred`;
      if (this.debug) {
        ret = result;
      }
    }
    return ret;
  }

  delete$(req, res, serviceInput) {
    return from(this.delete(req, res, serviceInput));
  }

  async deleteSL(req, res, serviceInput: IServiceInput) {
    this.logger.logDebug("BillService::updateSL()/01");
    let ret: any = [];
    await this.initSqlite(req, res);
    const repo = await this.sqliteConn.getRepository(serviceInput.serviceModel);
    const result = await repo.delete(serviceInput.cmd.query.where);
    this.logger.logDebug("BaseService::deleteSL()/result:", result);
    if ("affected" in result) {
      this.cdResp.app_state.success = true;
      this.cdResp.app_state.info.app_msg = `${result.affected} record/s deleted`;
      ret = result;
    } else {
      this.cdResp.app_state.success = false;
      this.cdResp.app_state.info.app_msg = `some error occorred`;
      if (this.debug) {
        ret = result;
      }
    }
    return ret;
  }

  deleteSL$(req, res, serviceInput) {
    return from(this.deleteSL(req, res, serviceInput));
  }

  //////////////////////////
  // TEST JSON MYSQL QUERY:

  /**
     * 
         {
            "ctx": "Sys",
            "m": "InteRact",
            "c": "InteRactPub",
            "a": "TestJsonQuery",
            "dat": {
                "f_vals": [
                    {
                        "query": {
                            "select": [
                                "inte_ract_pub_id",
                                "inte_ract_pub_name",
                                "inte_ract_pub_description",
                                "inte_ract_pub_guid",
                                "doc_id",
                                "inte_ract_pub_type_id",
                                "public",
                                "m",
                                "c",
                                "j_val"
                            ],
                            "where": [
                                {
                                    "conjType": "",
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
    * @param filter 
    */
  // type orm query json column
  // this.repo.query('SELECT some-column->"$.email_verification.token" as `token`  FROM `user` WHERE some-column->"$.email_verification.token" = "some-token";');

  // getManager().getRepository(User)
  //     .createQueryBuilder('user')
  //     .select()
  //     .where(`user.address ::jsonb @> \'{"state":"${query.location}"}\'`)

  async readJSON(req, res, serviceInput: IServiceInput): Promise<any> {
    this.logger.logDebug("BaseService::readJSON()/01");
    await this.init(req, res);
    // await this.setRepo(serviceInput.serviceModel)
    await this.setRepo(serviceInput);
    this.logger.logDebug("BaseService::readJSON()/02");
    this.logger.logDebug("BaseService::readJSON()/repo/model:", {
      serviceModel: serviceInput.serviceModel,
    });
    // const repo: any = await this.repo(req, res, serviceInput.serviceModel);
    const repo: any = this.repo;
    this.logger.logDebug("BaseService::readJSON()/03");
    let r: any = null;
    const q = serviceInput.cmd.query;
    switch (serviceInput.cmd.action) {
      case "find":
        try {
          this.logger.logDebug("BaseService::readJSON()/031");
          // r = await repo.find(serviceInput.cmd.query);
          this.logger.logDebug("BaseService::readJSON()/q:", q);
          // working- option 1:
          // r = await repo.query('SELECT * FROM `inte_ract_pub` WHERE j_val->"$.domain.group.doc_id" = 11091;');

          // working-option 2:
          r = await repo
            .createQueryBuilder("inte_ract_pub")
            /**
             * at the moment any effort to query selected fields
             * have not worked. No error but returns []
             * below options have been tested
             * .select(q.select) with q.select as array of fields
             * .select(['inte_ract_pub.inte_ract_pub_id'])
             * NB: When config is set with logs on, the same sql generated retrieves data but
             * when used here, there is and empry [] as result.
             */
            .select()
            .where(`${this.getQbFilter(<IQbInput>q)}`)
            .getMany();
          this.logger.logDebug("BaseService::readJSON()/04");
          if (serviceInput.extraInfo) {
            this.logger.logDebug("BaseService::readJSON()/05");
            return {
              result: r,
              fieldMap: await this.feildMap(serviceInput),
            };
          } else {
            this.logger.logDebug("BaseService::readJSON()/06");
            return await r;
          }
        } catch (err) {
          this.logger.logDebug("BaseService::readJSON()/07");
          return await this.serviceErr(req, res, err, "BaseService:read");
        }
        break;
      case "count":
        try {
          r = await repo.count(serviceInput.cmd.query);
          this.logger.logDebug("BaseService::readJSON()/r:", r);
          return r;
        } catch (err) {
          return await this.serviceErr(req, res, err, "BaseService:readJSON");
        }
        break;
    }

    // this.serviceErr(res, err, 'BaseService:read');
  }

  readJSON$(req, res, serviceInput): Observable<any> {
    return from(this.readJSON(req, res, serviceInput));
  }

  getQbFilter(q: IQbInput) {
    let ret = "";
    q.where.forEach((qItem) => {
      let conjType = "";
      if (qItem.conjType) {
        conjType = qItem.conjType;
      }
      if (qItem.dataType === "json") {
        ret += ` ${conjType} JSON_EXTRACT(${qItem.field}, ${qItem.jPath}) ${qItem.operator} ${qItem.val} `;
      } else {
        ret += ` ${conjType} ${qItem.field} ${qItem.operator} ${qItem.val} `;
      }
    });
    return ret;
  }
  /////////////////////////
  // Redis stuff

  async redisInit(req, res) {
    this.redisClient = createClient();
    this.redisClient.on("error", async (err) => {
      this.logger.logDebug("BaseService::redisCreate()/02");
      this.err.push(err.toString());
      const i = {
        messages: this.err,
        code: "BaseService:redisCreate",
        app_msg: "",
      };
      await this.serviceErr(req, res, this.err, "BaseService:redisCreate");
      return this.cdResp;
    });

    await this.redisClient.connect();
  }

  async wsRedisInit() {
    this.logger.logDebug("BaseService::wsRedisInit()/01");
    this.redisClient = createClient();
    this.logger.logDebug(
      "BaseService::wsRedisInit()/this.redisClient:",
      this.redisClient
    );
    this.redisClient.on("error", async (err) => {
      this.logger.logDebug("BaseService::redisCreate()/err:", err);
      this.err.push(err.toString());
      const i = {
        messages: this.err,
        code: "BaseService:redisCreate",
        app_msg: "",
      };
      await this.wsServiceErr(this.err, "BaseService:redisCreate");
      return this.cdResp;
    });
    await this.redisClient.connect();
  }

  async redisCreate(req, res) {
    await this.redisInit(req, res);
    this.logger.logDebug("BaseService::redisCreate()/01");
    const pl: CacheData = await this.getPlData(req);
    this.logger.logDebug("BaseService::redisCreate()/pl:", pl);
    try {
      const setRet = await this.redisClient.set(pl.key, pl.value);
      this.logger.logDebug("BaseService::redisCreate()/setRet:", setRet);
      const readBack = await this.redisClient.get(pl.key);
      this.logger.logDebug("BaseService::redisCreate()/readBack:", readBack);
      return {
        status: setRet,
        saved: readBack,
      };
    } catch (e) {
      this.logger.logDebug("BaseService::redisCreate()/04");
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:redisCreate",
        app_msg: "",
      };
      await this.serviceErr(req, res, this.err, "BaseService:redisCreate");
      return this.cdResp;
    }
  }

  async wsRedisCreate(k, v) {
    await this.wsRedisInit();
    try {
      const setRet = await this.redisClient.set(k, v);
      this.logger.logDebug(
        `BaseService::wsRedisCreate()/setRet:${JSON.stringify(setRet)}`
      );
      const readBack = await this.redisClient.get(k);
      this.logger.logDebug(
        `BaseService::wsRedisCreate()/readBack:${JSON.stringify(readBack)}`
      );
      return {
        status: setRet,
        saved: readBack,
      };
    } catch (e) {
      this.logger.logDebug("BaseService::wsRedisCreate()/04");
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:wsRedisCreate",
        app_msg: "",
      };
      await this.wsServiceErr(this.err, "BaseService:redisCreate");
      return this.cdResp;
    }
  }

  async redisRead(req, res, serviceInput: IServiceInput) {
    this.logger.logDebug("BaseService::redisRead()/01");
    await this.redisInit(req, res);
    this.logger.logDebug("BaseService::redisRead()/02");
    const pl: CacheData = await this.getPlData(req);
    this.logger.logDebug("BaseService::redisRead()/pl:", pl);
    try {
      const getRet = await this.redisClient.get(pl.key);
      this.logger.logDebug("BaseService::redisRead()/getRet:", getRet);
      return getRet;
    } catch (e) {
      this.logger.logDebug("BaseService::redisRead()/04");
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:redisRead",
        app_msg: "",
      };
      await this.serviceErr(req, res, this.err, "BaseService:redisRead");
      return this.cdResp;
    }
  }

  async wsRedisRead(k) {
    this.logger.logDebug("BaseService::wsRedisRead()/k:", k);
    const ret = {
      r: "",
      error: null,
    };
    // await this.wsRedisInit();
    try {
      // const getRet = await this.redisClient.get(k);
      ret.r = await this.svRedis.get(k);
      this.logger.logDebug("BaseService::redisRead()/ret:", { result: ret });
      return ret;
    } catch (e) {
      this.logger.logDebug("BaseService::redisRead()/04");
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:redisRead",
        app_msg: "",
      };
      await this.wsServiceErr(this.err, "BaseService:redisRead");
      // return this.cdResp;
      ret.error = e.toString();
      return ret;
    }
  }

  redisDelete(req, res, serviceInput: IServiceInput) {
    this.redisClient.del("foo", (err, reply) => {
      if (err) throw err;
      this.logger.logDebug(reply);
    });
  }

  async redisAsyncRead(req, res, serviceInput: IServiceInput) {
    return new Promise((resolve, reject) => {
      this.redisClient.get("myhash", (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async wsServiceErr(e, eCode, cdToken = null) {
    this.logger.logDebug(
      `Error as BaseService::wsServiceErr, e: ${e.toString()} `
    );
    const svSess = new SessionService();
    svSess.sessResp.cd_token = cdToken;
    svSess.sessResp.ttl = svSess.getTtl();
    this.setAppState(true, this.i, svSess.sessResp);
    this.err.push(e.toString());
    const i = {
      messages: await this.err,
      code: eCode,
      app_msg: `Error at ${eCode}: ${e.toString()}`,
    };
    await this.setAppState(false, i, svSess.sessResp);
    this.cdResp.data = [];
  }

  async bFetch(req, res, serviceInput: IServiceInput) {
    try {
      this.logger.logDebug("BaseService::fetch()/01");

      const response = await fetch(
        serviceInput.fetchInput.url,
        serviceInput.fetchInput.optins
      );
      const data = await response.json();
      // this.logger.logDebug(JSON.stringify(data, null, 2));
      return data;
    } catch (e) {
      this.err.push(e.toString());
      const i = {
        messages: this.err,
        code: "BaseService:update",
        app_msg: "",
      };
      // await this.setAppState(false, i, null);
      await this.serviceErr(req, res, e, i.code);
      return this.cdResp;
    }
  }

  // the modified query is a collection of filters that are based
  // on several parameters. When applied against some models, some parameters may not be compatible
  // validateQuery() removes parameters that are not valid for given models
  /**
   * Validates the `where` clause of a query object by removing fields that do not match properties in the model.
   * Supports both conjunction (AND) and disjunction (OR) queries.
   * @param q - The query object with a `where` clause.
   * @param model - The model object containing valid database fields.
   * @returns The validated query object.
   */
  // async validateQuery<T>(q: { where: Record<string, any> | Record<string, any>[] }, model: T): Promise<{ where: Record<string, any> | Record<string, any>[] }> {
  //     if (!q.where || (typeof q.where !== 'object' && !Array.isArray(q.where))) {
  //         console.warn("Invalid 'where' clause in query object.");
  //         return q;
  //     }

  //     // Get valid keys from the model
  //     const modelKeys = new Set(Object.keys(model));

  //     // Helper function to filter a single `where` object
  //     const filterWhere = (whereClause: Record<string, any>) => {
  //         return Object.keys(whereClause)
  //             .filter(key => modelKeys.has(key))
  //             .reduce((acc, key) => {
  //                 acc[key] = whereClause[key];
  //                 return acc;
  //             }, {} as Record<string, any>);
  //     };

  //     // Handle `where` as an array (OR query)
  //     if (Array.isArray(q.where)) {
  //         q.where = q.where.map(whereClause => filterWhere(whereClause));
  //     } else {
  //         // Handle `where` as an object (AND query)
  //         q.where = filterWhere(q.where);
  //     }

  //     return q;
  // }
  async validateQuery<T>(
    q: { where: Record<string, any> | Record<string, any>[] },
    model: T
  ): Promise<{ where: Record<string, any> | Record<string, any>[] }> {
    if (!q.where || (typeof q.where !== "object" && !Array.isArray(q.where))) {
      console.warn("Invalid 'where' clause in query object.");
      return q;
    }

    // Extract model keys using `Object.keys` directly on the model instance
    const modelKeys = new Set(Object.keys(model));

    // Helper function to filter a single `where` object
    const filterWhere = (whereClause: Record<string, any>) => {
      return Object.keys(whereClause)
        .filter((key) => modelKeys.has(key))
        .reduce((acc, key) => {
          acc[key] = whereClause[key];
          return acc;
        }, {} as Record<string, any>);
    };

    // Handle `where` as an array (OR query)
    if (Array.isArray(q.where)) {
      q.where = q.where.map((whereClause) => filterWhere(whereClause));
    } else {
      // Handle `where` as an object (AND query)
      q.where = filterWhere(q.where);
    }

    return q;
  }

  //////////////////////////////////////////////////

  async validateInputRefernce(
    msg: string,
    validationResponse: any[],
    svSess: SessionService
  ): Promise<boolean> {
    if (validationResponse.length > 0) {
      this.logger.logDebug("BaseService::validateCreate()/1");
      return true;
    } else {
      // this.logger.logDebug('BaseService::validateCreate()/2')
      // this.i.app_msg = `${validationItem} reference is invalid`;
      // this.err.push(this.i.app_msg);
      // this.setAppState(false, this.i, svSess.sessResp);
      this.setAlertMessage(msg, svSess, false);
      return false;
    }
  }

  async setAlertMessage(msg: string, svSess: SessionService, success: boolean) {
    this.i.app_msg = msg;
    this.err.push(this.i.app_msg);
    await this.setAppState(success, this.i, svSess.sessResp);
  }

  logTimeStamp(msg: string = null) {
    const first_parameter = arguments[0];
    const other_parameters = Array.prototype.slice.call(arguments, 1);

    function formatConsoleDate(date) {
      const hour = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const milliseconds = date.getMilliseconds();

      return (
        "[" +
        (hour < 10 ? "0" + hour : hour) +
        ":" +
        (minutes < 10 ? "0" + minutes : minutes) +
        ":" +
        (seconds < 10 ? "0" + seconds : seconds) +
        "." +
        ("00" + milliseconds).slice(-3) +
        "] : " +
        msg
      );
    }

    console.log.apply(
      console,
      [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters)
    );
  }

  controllerCreate(req, res) {
    return 1;
  }

  controllerUpdate(req, res) {
    return 1;
  }

  controllerDelete(req, res) {
    return 1;
  }

  intersect(arrA, arrB, intersectionField) {
    return Lá.intersectionBy(arrA, arrB, intersectionField);
  }

  intersectionLegacy = (arr1, arr2) => {
    const res = [];
    // for(let i = 0; i < arr1.length; i++){
    for (const i of arr1) {
      if (!arr2.includes(i)) {
        continue;
      }
      res.push(i);
    }
    return res;
  };

  intersectMany = (...arrs) => {
    let res = arrs[0].slice();
    for (let i = 1; i < arrs.length; i++) {
      res = this.intersectionLegacy(res, arrs[i]);
    }
    return res;
  };

  isEmpty(value) {
    return value == null || value.length === 0;
  }

  /**
   *
   * The type K is constrained to be a value computed from the keyof operator on
   * type T. Remember that the keyof operator will return a string literal type that is made
   * up of the properties of an object, so K will be constrained to the property names of
   * the type T.
   *
   * @param object
   * @param key
   */
  getProperty<T, K extends keyof T>(object: T, key: K) {
    const propertyValue = object[key];
  }

  ///////////////////////

  createClassInstance<T>(arg1: new () => T): T {
    return new arg1();
  }

  // new crude base after upgrading typeorm
  // 31 oct 2023
  /////////////////////

  async setRepo(serviceInput: IServiceInput) {
    // const AppDataSource = await getDataSource();
    // this.repo = AppDataSource.getRepository(serviceInput.serviceModel);
    this.repo = this.ds.getRepository(serviceInput.serviceModel);
  }

  async all(request: Request, response: Response, next: NextFunction) {
    return this.repo.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.userId);

    const user = await this.repo.findOne({
      where: { userId: id },
    });

    if (!user) {
      return "unregistered user";
    }
    return user;
  }

  async save(
    request: Request,
    response: Response,
    serviceInput: IServiceInput,
    next: NextFunction
  ) {
    const item = Object.assign(serviceInput.serviceInstance, serviceInput.data);
    return this.repo.save(item);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    let userToRemove = await this.repo.findOneBy({ userId: id });

    if (!userToRemove) {
      return "this user not exist";
    }

    await this.repo.remove(userToRemove);

    return "user has been removed";
  }

  //////////////////////////////////////////////////////////////

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  // depricated
  // siGet(q: IQuery, cls: any): IServiceInput {
  //   return {
  //     serviceModel: cls.serviceModel,
  //     docName: `${cls.modelName}::siGet`,
  //     cmd: {
  //       action: "find",
  //       query: q,
  //     },
  //     dSource: 1,
  //   };
  // }
  siGet<T>(q: IQuery, dn: string, model: new () => T): IServiceInput {
    return {
      serviceModel: model,
      docName: dn,
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
  }
}
