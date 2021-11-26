import { BaseService } from '../../base/base.service';
import { CdService } from '../../base/cd.service';
import { CreateIParams, IRespInfo, IServiceInput, IUser } from '../../base/IBase';
import { CdObjModel } from '../models/cd-obj.model';

export class CdObjService extends CdService {
    b: any; // instance of BaseService
    cdToken: string;
    user: IUser;

    serviceModel: CdObjModel;

    /*
     * create rules
     */
    cRules: any = {
        required: ['cdObjName', 'cdObjTypeGuid', 'parentModuleGuid'],
        noDuplicate: ['cdObjName', 'parentModuleGuid']
    };
    uRules: any[];
    dRules: any[];

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CdObjModel();
    }

    async create() {
        //
    }

    async createI(req, res, createIParams: CreateIParams):Promise<CdObjModel|boolean>{
        return await this.b.createI(req, res,createIParams)
    }

    async cdObjectExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CdObjModel,
            docName: 'CdObjService::cdObjectExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async beforeCreate(req, res): Promise<any> {
        //
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    async update(req, res) {
        //
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
}