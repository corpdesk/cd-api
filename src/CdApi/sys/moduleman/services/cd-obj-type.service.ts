import { BaseService } from "../../base/base.service";
import { CdService } from "../../base/cd.service";
import { SessionService } from "../../user/services/session.service";
import { UserService } from "../../user/services/user.service";
import { ModuleModel } from "../models/module.model";
import {
  CreateIParams,
  IQuery,
  IRespInfo,
  IServiceInput,
  IUser,
} from "../../base/IBase";
// import { CdObjTypeModel } from "../models/cd-obj-type.model";
import { ModuleViewModel } from "../models/module-view.model";
// import { CdObjTypeTypeViewModel } from "../models/cd-obj-type-view.model";
// import { CdObjTypeModel } from "../models/cd-obj-type-type.model";
import { UserModel } from "../../user/models/user.model";
import {
  CdDescriptor,
//   mapDescriptorToCdObjType,
} from "../../cd-dev/models/dev-descriptor.model";
import CdLogg from "../../utils/cd-logger.controller";
import { CdObjTypeModel } from "../models/cd-obj-type.model";

export class CdObjTypeTypeService extends CdService {
  b: any; // instance of BaseService
  cdToken: string;
  srvSess: SessionService;
  srvUser: UserService;
  user: IUser;
  serviceModel: CdObjTypeModel;
  sessModel;
  moduleModel: ModuleModel;

  /*
   * create rules
   */
  cRules: any = {
    required: ["cdObjTypeName", "cdObjTypeGuid"],
    noDuplicate: ["cdObjTypeName"],
  };
  uRules: any[];
  dRules: any[];

  constructor() {
    super();
    this.b = new BaseService();
    this.serviceModel = new CdObjTypeModel();
    this.moduleModel = new ModuleModel();
  }

  // /**
  //  * {
  //         "ctx": "Sys",
  //         "m": "Moduleman",
  //         "c": "CdObjType",
  //         "a": "Create",
  //         "dat": {
  //             "f_vals": [
  //                 {
  //                     "data": {
  //                         "cdObjTypeName": "/src/CdApi/sys/moduleman",
  //                         "cdObjTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
  //                     }
  //                 }
  //             ],
  //             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
  //         },
  //         "args": {}
  //     }
  //  * @param req
  //  * @param res
  //  */
  async create(req, res) {
    console.log("CdObjTypeTypeService::create()/01");
    const svSess = new SessionService();
    if (await this.validateCreate(req, res)) {
      console.log("CdObjTypeTypeService::create()/02");
      await this.beforeCreate(req, res);
      const serviceInput = {
        serviceInstance: this,
        serviceModel: CdObjTypeModel,
        serviceModelInstance: this.serviceModel,
        docName: "Create cdObj",
        dSource: 1,
      };
      console.log("CdObjTypeTypeService::create()/req.post:", req.post);
      const respData = await this.b.create(req, res, serviceInput);
      this.b.i.app_msg = "new cdObj created";
      this.b.setAppState(true, this.b.i, svSess.sessResp);
      this.b.cdResp.data = await respData;
      const r = await this.b.respond(req, res);
    } else {
      console.log("CdObjTypeTypeService::create()/03");
      this.b.setAppState(false, this.b.i, svSess.sessResp);
      const r = await this.b.respond(req, res);
    }
  }

  async createI(
    req,
    res,
    createIParams: CreateIParams
  ): Promise<CdObjTypeModel | boolean> {
    // const params = {
    //   controllerInstance: this,
    //   model: CdObjTypeModel,
    // };

    console.log("CdObjTypeTypeService::createI()/this.cRules:", this.cRules);
    // console.log("CdObjTypeTypeService::createI()/params:", params);
    console.log("CdObjTypeTypeService::createI()/createIParams:", createIParams);
    if (await this.b.validateUniqueI(req, res, createIParams)) {
      if (await this.b.validateRequiredI(req, res, createIParams)) {
        return await this.b.createI(req, res, createIParams);
      } else {
        this.b.i.app_msg = `the required fields ${this.cRules.required.join(
          ", "
        )} is missing`;
        this.b.err.push(this.b.i.app_msg);
        return false;
      }
    } else {
      this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(
        ", "
      )}   is not allowed`;
      this.b.err.push(this.b.i.app_msg);
      return false;
    }
  }

  async cdObjectExists(req, res, params): Promise<boolean> {
    const serviceInput: IServiceInput = {
      serviceInstance: this,
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::cdObjectExists",
      cmd: {
        action: "find",
        query: { where: params.filter },
      },
      dSource: 1,
    };
    return this.b.read(req, res, serviceInput);
  }

  async beforeCreate(req, res): Promise<any> {
    this.b.setPlData(req, { key: "cdObjGuid", value: this.b.getGuid() });
    this.b.setPlData(req, { key: "cdObjEnabled", value: true });
    return true;
  }

  async read(req, res, serviceInput: IServiceInput): Promise<any> {
    //
  }

  async update(req, res) {
    // console.log('CdObjTypeTypeService::update()/01');
    let q = this.b.getQuery(req);
    q = this.beforeUpdate(q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::update",
      cmd: {
        action: "update",
        query: q,
      },
      dSource: 1,
    };
    // console.log('CdObjTypeTypeService::update()/02')
    this.b.update$(req, res, serviceInput).subscribe((ret) => {
      this.b.cdResp.data = ret;
      this.b.respond(req, res);
    });
  }

  

  /**
   * harmonise any data that can
   * result in type error;
   * @param q
   * @returns
   */
  beforeUpdate(q: any) {
    if (q.update.cdObjEnabled === "") {
      q.update.cdObjEnabled = null;
    }
    if (q.update.showIcon === "") {
      q.update.showIcon = null;
    }
    return q;
  }

  async remove(req, res) {
    //
  }

  /**
   * methods for transaction rollback
   */
  rbCreate(): number {
    return 1;
  }

  rbUpdate(): number {
    return 1;
  }

  rbDelete(): number {
    return 1;
  }

  async validateCreate(req, res) {
    const svSess = new SessionService();
    ///////////////////////////////////////////////////////////////////
    // 1. Validate against duplication
    const params = {
      controllerInstance: this,
      model: CdObjTypeModel,
    };
    this.b.i.code = "CdObjTypeTypeService::validateCreate";
    let ret = false;

    ///////////////////////////////////////////////////////////////////
    // 2. confirm the cd_obj referenced exists
    let pl: CdObjTypeModel = this.b.getPlData(req);

    // if ('cdObjTypeGuid' in pl) {
    //     const serviceInput = {
    //         serviceModel: CdObjTypeModel,
    //         docName: 'CdObjTypeTypeService::validateCreate',
    //         cmd: {
    //             action: 'find',
    //             query: { where: { cdObjTypeGuid: pl.cdObjTypeGuid } }
    //         },
    //         dSource: 1
    //     }
    //     const r: any = await this.b.read(req, res, serviceInput)
    //     if (r.length > 0) {
    //         ret = true;
    //     } else {
    //         ret = false;
    //         this.b.i.app_msg = `cdObj type reference is invalid`;
    //         this.b.err.push(this.b.i.app_msg);
    //     }
    // } else {
    //     this.b.i.app_msg = `parentModuleGuid is missing in payload`;
    //     this.b.err.push(this.b.i.app_msg);
    // }
    if ("cdObjTypeGuid" in pl) {
      console.log("CdObjTypeTypeService::validateCreate()/01");
      console.log("CdObjTypeTypeService::validateCreate()/pl:", pl);
      const serviceInput = {
        serviceModel: CdObjTypeModel,
        docName: "CdObjTypeTypeService::getcdObjType",
        cmd: {
          action: "find",
          query: { where: { cdObjTypeGuid: pl.cdObjTypeGuid } },
        },
        dSource: 1,
      };
      const cdObjTypeData: CdObjTypeModel[] = await this.b.read(
        req,
        res,
        serviceInput
      );
      console.log(
        "CdObjTypeTypeService::validateCreate()/cdObjTypeData:",
        cdObjTypeData
      );
      if (
        await this.b.validateInputRefernce(
          `cdObj type reference is invalid`,
          cdObjTypeData,
          svSess
        )
      ) {
        console.log("CdObjTypeTypeService::validateCreate()/02");
        console.log(
          "CdObjTypeTypeService::validateCreate()/cdObjTypeData:",
          cdObjTypeData
        );
        if (cdObjTypeData[0].cdObjTypeName === "user") {
          console.log("CdObjTypeTypeService::validateCreate()/03");
          if ("objGuid" in pl) {
            console.log("CdObjTypeTypeService::validateCreate()/04");
            ret = true;
            await this.b.setPlData(req, {
              key: "cdObjName",
              value: pl.objGuid,
            });
            const userData: UserModel[] = await this.b.get(
              req,
              res,
              UserModel,
              { where: { userGuid: pl.objGuid } }
            );
            await this.b.setPlData(req, {
              key: "objId",
              value: userData[0].userId,
            });
          } else {
            console.log("CdObjTypeTypeService::validateCreate()/05");
            this.b.setAlertMessage(
              `if registering user type, objGuid must be provided`,
              svSess
            );
          }
        }
      } else {
        console.log("CdObjTypeTypeService::validateCreate()/06");
        ret = false;
        this.b.setAlertMessage(`cdObj type reference is invalid`, svSess);
      }
    } else {
      console.log("CdObjTypeTypeService::validateCreate()/07");
      this.b.setAlertMessage(`parentModuleGuid is missing in payload`, svSess);
    }

    ///////////////////////////////////////////////////////////////////
    // 3. confirm the parent referenced exists
    if ("parentModuleGuid" in pl) {
      console.log("CdObjTypeTypeService::validateCreate()/08");
      const serviceInput = {
        serviceModel: ModuleModel,
        docName: "CdObjTypeTypeService::getModuleMenu$",
        cmd: {
          action: "find",
          query: { where: { moduleGuid: pl.parentModuleGuid } },
        },
        dSource: 1,
      };
      const moduleData: ModuleModel[] = await this.b.read(
        req,
        res,
        serviceInput
      );
      await this.b.setPlData(req, {
        key: "parentModuleId",
        value: moduleData[0].moduleId,
      });
      console.log("CdObjTypeTypeService::validateCreate()/moduleData:", moduleData);
      if (moduleData.length > 0) {
        console.log("CdObjTypeTypeService::validateCreate()/09");
        ret = true;
      } else {
        console.log("CdObjTypeTypeService::validateCreate()/10");
        ret = false;
        this.b.i.app_msg = `parent reference is invalid`;
        this.b.err.push(this.b.i.app_msg);
      }
    } else {
      console.log("CdObjTypeTypeService::getCdObjType/11");
      this.b.i.app_msg = `parentModuleGuid is missing in payload`;
      this.b.err.push(this.b.i.app_msg);
    }

    console.log("CdObjTypeTypeService::getCdObjType/111");
    console.log(
      "CdObjTypeTypeService::validateCreate()/req.post",
      safeStringify(req.post)
    );
    pl = this.b.getPlData(req);
    console.log("CdObjTypeTypeService::validateCreate()/pl", safeStringify(pl));
    if (await this.b.validateUnique(req, res, params)) {
      if (await this.b.validateRequired(req, res, this.cRules)) {
        ret = true;
      } else {
        ret = false;
        this.b.i.app_msg = `the required fields ${this.cRules.required.join(
          ", "
        )} is missing`;
        this.b.err.push(this.b.i.app_msg);
      }
    } else {
      ret = false;
      this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(
        ", "
      )} is not allowed`;
      this.b.err.push(this.b.i.app_msg);
    }
    /////////////////////////////////////////////

    console.log("CdObjTypeTypeService::getCdObjType/13");
    if (this.b.err.length > 0) {
      console.log("CdObjTypeTypeService::validateCreate()/14");
      console.log("CdObjTypeTypeService::validateCreate()/this.b.err:", this.b.err);
      ret = false;
    }
    console.log("CdObjTypeTypeService::getCdObjType/15");
    console.log("CdObjTypeTypeService::getCdObjType/ret:", ret);
    return ret;
  }

  async getCdObjType(req, res) {
    const q = this.b.getQuery(req);
    console.log("CdObjTypeTypeService::getCdObjType/f:", q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::getCdObjType$",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    try {
      this.b.read$(req, res, serviceInput).subscribe((r) => {
        console.log("CdObjTypeTypeService::read$()/r:", r);
        this.b.i.code = "CdObjTypeController::Get";
        const svSess = new SessionService();
        svSess.sessResp.cd_token = req.post.dat.token;
        svSess.sessResp.ttl = svSess.getTtl();
        this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = r;
        this.b.respond(req, res);
      });
    } catch (e) {
      console.log("CdObjTypeTypeService::read$()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "BaseService:update",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  async getCdObjTypeType(req, res) {
    const q = this.b.getQuery(req);
    console.log("CdObjTypeTypeService::getCdObjType/q:", q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::getCdObjTypeType$",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    try {
      this.b.read$(req, res, serviceInput).subscribe((r) => {
        console.log("CdObjTypeTypeService::read$()/r:", r);
        this.b.i.code = "CdObjTypeController::Get";
        const svSess = new SessionService();
        svSess.sessResp.cd_token = req.post.dat.token;
        svSess.sessResp.ttl = svSess.getTtl();
        this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = r;
        this.b.respond(req, res);
      });
    } catch (e) {
      console.log("CdObjTypeTypeService::read$()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "BaseService:update",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  getCdObjTypeCount(req, res) {
    const q = this.b.getQuery(req);
    console.log("CdObjTypeTypeService::getCdObjTypeCount/q:", q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::getCdObjTypeCount$",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    this.b.readCount$(req, res, serviceInput).subscribe((r) => {
      this.b.i.code = "CdObjTypeController::Get";
      const svSess = new SessionService();
      svSess.sessResp.cd_token = req.post.dat.token;
      svSess.sessResp.ttl = svSess.getTtl();
      this.b.setAppState(true, this.b.i, svSess.sessResp);
      this.b.cdResp.data = r;
      this.b.respond(req, res);
    });
  }

  getCdObjTypeQB(req, res) {
    console.log("CdObjTypeTypeService::getCdObjTypeQB()/1");
    this.b.entityAdapter.registerMappingFromEntity(CdObjTypeModel);
    const q = this.b.getQuery(req);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::getCdObjTypeQB",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };

    this.b.readQB$(req, res, serviceInput).subscribe((r) => {
      this.b.i.code = serviceInput.docName;
      const svSess = new SessionService();
      svSess.sessResp.cd_token = req.post.dat.token;
      svSess.sessResp.ttl = svSess.getTtl();
      this.b.setAppState(true, this.b.i, svSess.sessResp);
      this.b.cdResp.data = r;
      this.b.respond(req, res);
    });
  }

  getCdObjTypeTypeCount(req, res) {
    const q = this.b.getQuery(req);
    console.log("CdObjTypeTypeService::getCdObjTypeCount/q:", q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::getCdObjTypeCount$",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    this.b.readCount$(req, res, serviceInput).subscribe((r) => {
      this.b.i.code = "CdObjTypeController::Get";
      const svSess = new SessionService();
      svSess.sessResp.cd_token = req.post.dat.token;
      svSess.sessResp.ttl = svSess.getTtl();
      this.b.setAppState(true, this.b.i, svSess.sessResp);
      this.b.cdResp.data = r;
      this.b.respond(req, res);
    });
  }

  async getCdObjTypeTypeI(req, res, q: IQuery = null): Promise<CdObjTypeModel[]> {
    console.log("CdObjTypeTypeService::getCdObjTypeTypeI()/starting...");
    console.log("CdObjTypeTypeService::getCdObjTypeTypeI/q:", q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::getCdObjTypeTypeI",
      cmd: {
        action: "find",
        query: q,
      },
      dSource: 1,
    };
    try {
      return await this.b.read(req, res, serviceInput);
    } catch (e) {
      console.log("CdObjTypeTypeService::read$()/e:", e);
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CdObjTypeTypeService:getCdObjTypeTypeI",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
    }
  }

  async getCdObjTypeTypeByName(
    req,
    res,
    cdObjTypeName: string
  ): Promise<CdObjTypeModel[]> {
    return await this.getCdObjTypeTypeI(req, res, {
      where: { cdObjTypeName: cdObjTypeName },
    });
  }

  async cdObjTypeExists(req, res, q) {
    const ret = await this.getCdObjTypeTypeI(req, res, q);
    if (ret.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async updateI(req, res, q): Promise<any> {
    console.log("CdObjTypeTypeService::updateI()/01");
    // let q = this.b.getQuery(req);
    q = this.beforeUpdate(q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::updateI",
      cmd: {
        action: "update",
        query: q,
      },
      dSource: 1,
    };
    console.log("CdObjTypeTypeService::update()/02");
    return this.b.update(req, res, serviceInput);
  }

  delete(req, res) {
    const q = this.b.getQuery(req);
    console.log("CdObjTypeTypeService::delete()/q:", q);
    const serviceInput = {
      serviceModel: CdObjTypeModel,
      docName: "CdObjTypeTypeService::delete",
      cmd: {
        action: "delete",
        query: q,
      },
      dSource: 1,
    };

    this.b.delete$(req, res, serviceInput).subscribe((ret) => {
      this.b.cdResp.data = ret;
      this.b.respond(req, res);
    });
  }
}
