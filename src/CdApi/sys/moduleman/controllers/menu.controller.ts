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

export class ModulesService {

    b: BaseService;
    srvMenu: MenuService;

    constructor() {
        this.b = new BaseService();
        this.srvMenu = new MenuService();

    }

    async menuCollection(req, res) {
        try {
            await this.srvMenu.testMenu(req, res, userMenuData$);
        } catch (e) {
            this.b.serviceErr(res, e, 'RxTestController:menuCollection');
        }
    }

}