export class GroupInvitationController {
    public modelStr = 'group_invitation';
    public b; // handle to cd base controller
    private CD_AUTH_DRIVER; // should idealy be set at the config file
    private result = null;
    private hostGroup; // the group where the invitee is expected to join
    private rules = [];

    /*
     * create rules
     */
    public cRules = {
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

    constructor() {
        console.log('starting GroupInvitationController()');
    }

    actionCreate() {
        console.log('starting actionCreate()');
    }
}