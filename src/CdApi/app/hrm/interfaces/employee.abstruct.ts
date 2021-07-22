import { AppController } from '../../../sys/base/app.controller';

export abstract class EmployeeBase extends AppController {
    public id: number;
    public name: string;
    constructor(id: number, name: string) {
        super();
        this.id = id;
        this.name = name;
    }
}