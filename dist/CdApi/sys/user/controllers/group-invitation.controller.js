"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupInvitationController = void 0;
class GroupInvitationController {
    constructor() {
        this.modelStr = 'group_invitation';
        this.result = null;
        this.rules = [];
        /*
         * create rules
         */
        this.cRules = {
            'required': [
                'hostUser',
                'guestUser',
                'group_invitation_type_id',
                'group_id',
            ],
            'no_duplicate': [
                'hostUser',
                'guestUser',
                'group_id',
            ],
        };
        console.log('starting GroupInvitationController()');
    }
    actionCreate() {
        console.log('starting actionCreate()');
    }
}
exports.GroupInvitationController = GroupInvitationController;
//# sourceMappingURL=group-invitation.controller.js.map