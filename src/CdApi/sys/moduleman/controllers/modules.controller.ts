import { BaseService } from '../../base/base.service';
import { SessionService } from '../../user/services/session.service';
import { UserService } from '../../user/services/user.service';
import { NotificationService } from '../../comm/services/notification.service';
import { MemoService } from '../../comm/services/memo.service';
import { CalendarService } from '../../scheduler/services/calendar.services';
import { GroupMemberService } from '../../user/services/group-member.service';
import { ConsumerService } from '../../moduleman/services/consumer.service';

export class ModulesService {

    b: BaseService;

    constructor() {
        this.b = new BaseService();
    }

}