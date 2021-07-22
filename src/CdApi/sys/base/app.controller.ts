
import {
    IController,
    CdResponse,
    ModelRules,
    IUser,
} from './IBase'

export abstract class AppController implements IController {
    abstract b: any; // instance of BaseController
    abstract cdToken: string;
    abstract modelRules: ModelRules;
    user: IUser;

    public abstract actionCreate(req, res): CdResponse;
    public abstract actionUpdate(req, res): CdResponse;
    public abstract actionDelete(req, res): CdResponse;

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