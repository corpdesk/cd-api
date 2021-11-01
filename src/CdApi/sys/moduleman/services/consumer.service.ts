import { Observable } from 'rxjs';
import { BaseService } from '../../base/base.service';
import { IServiceInput } from '../../base/IBase';
import { ConsumerResourceViewModel } from '../models/consumer-resource-view.model';
import { ConsumerResourceModel } from '../models/consumer-resource.model';
import { ConsumerModel } from '../models/consumer.model';

export class ConsumerService{
    b: BaseService;

    constructor(){
        this.b = new BaseService();
    }

    getConsumerByGuid$(req, res, consmGuid): Observable<ConsumerModel[]>{
        // console.log('starting getConsumerByGuid(req, res, consmGuid)');
        const serviceInput: IServiceInput = {
            serviceModel: ConsumerModel,
            docName: 'ConsumerService::getConsumerByGuid',
            cmd: {
                action: 'find',
                query: { where: { consumerGuid: consmGuid } }
            },
            dSource: 1,
        }
        return this.b.read$(req, res, serviceInput);
    }

    async getIDByGuid(consumerGuid){
        return [{}];
    }

    async isConsumerResource(req, res, params){
        const serviceInput: IServiceInput = {
            serviceModel: ConsumerResourceViewModel,
            docName: 'ConsumerService::isConsumerResource',
            cmd: {
                action: 'count',
                query: { where: params }
            },
            dSource: 1,
        }
        const result = await this.b.read(req, res, serviceInput);
        if(result > 0){
            return true;
        } else {
            return false;
        }
    }

    getConsumerGuid(req){
        // console.log('starting getConsumerGuid(req)');
        // console.log('req.post:', JSON.stringify(req.post));
        // return req.post.sessData.consumerGuid;
        return req.post.dat.f_vals[0].data.consumer_guid;
    }

    consumerGuidIsValid() {
        return true;
    }
}