import { CdService } from '../../../sys/base/cd.service';

export abstract class EmployeeBase extends CdService {
    public id: number;
    public name: string;
    constructor(id: number, name: string) {
        super();
        this.id = id;
        this.name = name;
    }
}