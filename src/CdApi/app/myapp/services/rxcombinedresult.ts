// Description: a helper class that fuses two related data into hierachial manner via rxjs
// Ref Based on:  https://stackblitz.com/edit/angular-tonn5q?file=src%2Fapp%2Fapi-calls.service.ts
// Stack overflow discussion: https://stackoverflow.com/questions/55516707/loop-array-and-return-data-for-each-id-in-observable

import { map } from 'rxjs/operators';
import { forkJoin, mergeMap, Observable, of } from 'rxjs';
import { BaseService } from '../../../sys/base/base.service';

// Testing Data: parentData
const moduleData = [
    {
        moduleGuid: '5c9dda9aca9c171d6ba4b87e'
    },
    {
        moduleGuid: '5c9ddb82ca9c171d6ba4b87f'
    }
]

// Testing Data: childrentData
const menuData = [
    {
        moduleGuid: '5c9dda9aca9c171d6ba4b87e',
        firstName: 'Luke',
        lastName: 'Test',
        email: 'vgadgf@adsgasdg.com',
        created_date: '2019-03-29T08:43:06.344Z'
    },
    {
        moduleGuid: '5c9ddb82ca9c171d6ba4b87f',
        firstName: 'Second',
        lastName: 'Name',
        email: 'something@adsgasdg.com',
        created_date: '2018-01-29T08:43:06.344Z'
    }
]

export class RxCombinedResult {
    b: BaseService;

    constructor() {
        this.b = new BaseService();
    }

    public getMultipleRelationData(req, res, parentData): Observable<any> {
        return of(parentData);
    }


    public getSingleData(params, id): Observable<any> {
        const foundIdData = params.childrenData.find(data => data[params.relationshipField] === id);
        return of(foundIdData);
    }

    public getCombinedData(req, res) {
        const params = {
            parentData: moduleData, // see sample data above
            childrenData: menuData, // see sample data above
            parentLable: 'modules',
            childrenLable: 'menu',
            relationshipField: 'moduleGuid'
        };
        return this.getMultipleRelationData(req, res, params.parentData)
            .pipe(
                mergeMap((result: any) => {
                    const allIds = result.map(id => this.getSingleData(params, id[params.relationshipField]));
                    return forkJoin(...allIds).pipe(
                        map((childrentDataArray) => {
                            result.forEach((eachContact, index) => {
                                eachContact[params.childrenLable] = childrentDataArray[index];
                            })
                            return result;
                        })
                    )
                })
            )
            .subscribe((menu) => {
                console.log('modules:', menu);
                this.b.cdResp.data = menu;
                this.b.respond(res);
                // Expected Results from the sample data:
                // "data": [
                //     {
                //         "moduleGuid": "5c9dda9aca9c171d6ba4b87e",
                //         "menu": {
                //             "moduleGuid": "5c9dda9aca9c171d6ba4b87e",
                //             "firstName": "Luke",
                //             "lastName": "Test",
                //             "email": "vgadgf@adsgasdg.com",
                //             "created_date": "2019-03-29T08:43:06.344Z"
                //         }
                //     },
                //     {
                //         "moduleGuid": "5c9ddb82ca9c171d6ba4b87f",
                //         "menu": {
                //             "moduleGuid": "5c9ddb82ca9c171d6ba4b87f",
                //             "firstName": "Second",
                //             "lastName": "Name",
                //             "email": "something@adsgasdg.com",
                //             "created_date": "2018-01-29T08:43:06.344Z"
                //         }
                //     }
                // ]
            });
    }
}