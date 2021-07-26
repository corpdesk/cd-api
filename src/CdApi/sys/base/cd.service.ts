
import {
    ICdResponse,
    IModelRules,
    IUser,
} from './IBase'

export abstract class CdService {
    abstract b: any; // instance of BaseService
    abstract cdToken: string;
    user: IUser;

    public abstract create(req, res): Promise<void>;
    public abstract read(req, res): Promise<void>;
    public abstract update(req, res): Promise<void>;
    public abstract remove(req, res): Promise<void>;

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