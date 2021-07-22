"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupInvitationController = void 0;
var GroupInvitationController = /** @class */ (function () {
    function GroupInvitationController() {
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
    GroupInvitationController.prototype.actionCreate = function () {
        console.log('starting actionCreate()');
    };
    return GroupInvitationController;
}());
exports.GroupInvitationController = GroupInvitationController;
//# sourceMappingURL=group-invitation.controller.js.map