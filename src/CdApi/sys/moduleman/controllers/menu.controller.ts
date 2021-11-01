import { BaseService } from '../../base/base.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
import { NotificationService } from '../../comm/services/notification.service';
import { MemoService } from '../../comm/services/memo.service';
import { CalendarService } from '../../scheduler/services/calendar.services';
import { GroupMemberService } from '../../user/services/group-member.service';
import { ConsumerService } from '../../moduleman/services/consumer.service';
import { MenuService } from '../services/menu.service';
import { userMenuData$ } from '../../../app/myapp/services/userMenuData$';

export class MenuController {

    b: BaseService;
    svMenu: MenuService;

    constructor() {
        this.b = new BaseService();
        this.svMenu = new MenuService();

    }

    async menuCollection(req, res) {
        try {
            // await this.svMenu.testMenu(req, res, userMenuData$);
        } catch (e) {
            this.b.serviceErr(res, e, 'RxTestController:menuCollection');
        }
    }

    // /** Pageable request:
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Module",
    //         "a": "GetCount",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "select":["moduleId","moduleGuid"],
    //                         "where": {},
    //                         "take": 5,
    //                         "skip": 1
    //                         }
    //                 }
    //             ],
    //             "token": "29947F3F-FF52-9659-F24C-90D716BC77B2"
    //         },
    //         "args": null
    //     }
    //  * @param req
    //  * @param res
    //  */
    async GetCount(req, res) {
        console.log('starting GetCounter()')
        try {
            console.log('MenuController::GetCount()/reached 1')
            await this.svMenu.getMenuCount(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'ModuleController:Get');
        }
    }

    // /**
    //  *
    //  * {
    //         "ctx": "Sys",
    //         "m": "Moduleman",
    //         "c": "Menu",
    //         "a": "Update",
    //         "dat": {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "update": {
    //                             "menuName": "TesterMenu"
    //                         },
    //                         "where": {"menuId":93}
    //                     }
    //                 }
    //             ],
    //             "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
    //         },
    //         "args": {}
    //     }
    //  * @param req
    //  * @param res
    //  */
    async Update(req, res) {
        try {
            await this.svMenu.update(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'MenuController:Update');
        }
    }

    async Delete(req, res) {
        try {
            await this.svMenu.delete(req,res);
        } catch (e) {
            this.b.serviceErr(res, e,'MenuController:Update');
        }
    }

}