
import { BaseService } from './base.service';
import {
    CreateIParams,
    ICdResponse,
    IModelRules,
    IRespInfo,
    IServiceInput,
    IUser,
} from './IBase'

export abstract class CdService {
    abstract b: BaseService; // instance of BaseService
    abstract cdToken: string;
    user: IUser;
    cRules: any;
    uRules: any;
    dRules: any;
    serviceModel: any;

    public abstract create(req, res): Promise<any>;
    public abstract beforeCreate(req, res):Promise<any>;
    public abstract read(req, res, serviceInput: IServiceInput): Promise<any>;
    public abstract update(req, res): void;
    public abstract remove(req, res): void;

    // internal create interface
    public abstract createI(req, res, createIParams: CreateIParams);

    /**
     * methods for transaction rollback
     */
    protected rbCreate(): number {
        return 1;
    }

    protected rbUpdate(): number {
        return 1;
    }

    protected rbDelete(): number {
        return 1;
    }
}