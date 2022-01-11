import { BaseService } from '../../base/base.service';
import { CdService } from '../../base/cd.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
// import { ModuleModel } from '../models/module.model';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../base/IBase';
import { CompanyModel } from '../models/company.model';
// import { ModuleViewModel } from '../models/module-view.model';
import { CompanyViewModel } from '../models/company-view.model';
import { CompanyTypeModel } from '../models/company-type.model';
// import { CompanyViewModel } from '../models/company-view.model';

export class CompanyService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    srvSess: SessionService;
    srvUser: UserService;
    user: IUser;
    serviceModel: CompanyModel;
    sessModel;
    // moduleModel: ModuleModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['companyName', 'email', 'mobile', 'searchTags', 'companyTypeGuid'],
        noDuplicate: ['companyName', 'email']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CompanyModel();
        // this.moduleModel = new ModuleModel();
    }

    // /**
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Company",
    //         "a": "Create",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "data": {
    //                         "companyName": "/src/CdApi/sys/moduleman",
    //                         "companyTypeGuid": "7ae902cd-5bc5-493b-a739-125f10ca0268",
    //                         "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b"
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
        console.log('moduleman/create::validateCreate()/01')
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CompanyModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create company',
                dSource: 1,
            }
            console.log('CompanyService::create()/serviceInput:', serviceInput)
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new company created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        } else {
            console.log('moduleman/create::validateCreate()/02')
            const r = await this.b.respond(req, res);
        }
    }

    async createI(req, res, createIParams: CreateIParams): Promise<CompanyModel | boolean> {
        return await this.b.createI(req, res, createIParams)
    }

    async companyExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CompanyModel,
            docName: 'CompanyService::companyExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'companyGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'companyEnabled', value: true });
        return true;
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    update(req, res) {
        // console.log('CompanyService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CompanyModel,
            docName: 'CompanyService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('CompanyService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.companyEnabled === '') {
            q.update.companyEnabled = null;
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
        console.log('moduleman/CompanyService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CompanyModel,
        }
        this.b.i.code = 'CompanyService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.log('moduleman/CompanyService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('moduleman/CompanyService::validateCreate()/03')
                ret = true;
            } else {
                console.log('moduleman/CompanyService::validateCreate()/04')
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('moduleman/CompanyService::validateCreate()/05')
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('moduleman/CompanyService::validateCreate()/06')
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the companyTypeGuid referenced exists
        const pl: CompanyModel = this.b.getPlData(req);
        if ('companyTypeGuid' in pl) {
            console.log('moduleman/CompanyService::validateCreate()/07')
            console.log('moduleman/CompanyService::validateCreate()/pl:', pl)
            const serviceInput = {
                serviceModel: CompanyTypeModel,
                docName: 'CompanyService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { companyTypeGuid: pl.companyTypeGuid } }
                },
                dSource: 1
            }
            console.log('moduleman/CompanyService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
            const r: any = await this.b.read(req, res, serviceInput)
            console.log('moduleman/CompanyService::validateCreate()/r:', r)
            if (r.length > 0) {
                console.log('moduleman/CompanyService::validateCreate()/08')
                ret = true;
            } else {
                console.log('moduleman/CompanyService::validateCreate()/10')
                ret = false;
                this.b.i.app_msg = `company type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        } else {
            console.log('moduleman/CompanyService::validateCreate()/11')
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `companyTypeGuid is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.log('CompanyService::getCompany/12');
        if (this.b.err.length > 0) {
            console.log('moduleman/CompanyService::validateCreate()/13')
            ret = false;
        }
        return ret;
    }

    getCompany(req, res) {
        const q = this.b.getQuery(req);
        console.log('CompanyService::getCompany/f:', q);
        const serviceInput = {
            serviceModel: CompanyViewModel,
            docName: 'CompanyService::getCompany$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CompanyService::read$()/r:', r)
                    this.b.i.code = 'CompanyController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CompanyService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    getCompanyType(req, res) {
        const q = this.b.getQuery(req);
        console.log('CompanyService::getCompany/f:', q);
        const serviceInput = {
            serviceModel: CompanyTypeModel,
            docName: 'CompanyService::getCompanyType$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CompanyService::read$()/r:', r)
                    this.b.i.code = 'CompanyController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CompanyService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            this.b.serviceErr(req, res, e, i.code)
            this.b.respond(req, res)
        }
    }

    getCompanyCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CompanyService::getCompanyCount/q:', q);
        const serviceInput = {
            serviceModel: CompanyViewModel,
            docName: 'CompanyService::getCompanyCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CompanyController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    getCompanyTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CompanyService::getCompanyCount/q:', q);
        const serviceInput = {
            serviceModel: CompanyTypeModel,
            docName: 'CompanyService::getCompanyCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CompanyController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    delete(req, res) {
        const q = this.b.getQuery(req);
        console.log('CompanyService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CompanyModel,
            docName: 'CompanyService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }

        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }
}