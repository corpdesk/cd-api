import { OfficeWorker } from '../interfaces/officeworker.controller'
class Manager extends OfficeWorker {
    public employees: OfficeWorker[] = [];
    manageEmployees() {
        super.doWork();
        for (const employee of this.employees) {
            employee.doWork();
        }
    }
}