import { Observable } from 'rxjs';
import { BaseService } from '../../base/base.service';
import { GroupModel } from '../models/group.model';

export class GroupService {
    b: BaseService;

    constructor() {
        this.b = new BaseService();
    }

    getMemoSummary(cuid) {
        return [{}];
    }

    async getModuleGroup(req, res, moduleName): Promise<GroupModel[]> {
        const serviceInput = {
            serviceModel: GroupModel,
            docName: 'GroupService::getGroupByName',
            cmd: {
                action: 'find',
                filter: { where: { groupName: moduleName} }
            },
            dSource: 1,
        }
        return await this.b.read(req, res, serviceInput);
    }

    getModuleGroup$(req, res, moduleName): Observable<GroupModel[]> {
        const serviceInput = {
            serviceModel: GroupModel,
            docName: 'GroupService::getGroupByName',
            cmd: {
                action: 'find',
                filter: { where: { groupName: moduleName} }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput);
    }

    async getGroupByName(req, res, groupParams) {
        // console.log('starting GroupService::getGroupByName(req, res, groupParams)');
        // console.log('GroupService::getGroupByName/groupParams:', groupParams);
        if (groupParams.groupName) {
            const serviceInput = {
                serviceModel: GroupModel,
                docName: 'GroupService::getGroupByName',
                cmd: {
                    action: 'find',
                    filter: { where: { groupName: groupParams.groupName, groupTypeId: groupParams.groupTypeId } }
                },
                dSource: 1,
            }
            return await this.b.read(req, res, serviceInput);
        } else {
            console.log('groupParams.groupName is invalid');
        }
    }
}