import { getManager } from "typeorm";
import { BaseService } from "../../../sys/base/base.service";
import { CdService } from "../../../sys/base/cd.service";
import { CreateIParams, IQuery, IServiceInput } from "../../../sys/base/IBase";
import { CdObjTypeModel } from "../../../sys/moduleman/models/cd-obj-type.model";
import { GroupModel } from "../../../sys/user/models/group.model";
import { UserModel } from "../../../sys/user/models/user.model";
import { SessionService } from "../../../sys/user/services/session.service";
import { UserService } from "../../../sys/user/services/user.service";
import { CoopMemberModel } from "../models/coop-member.model";
import { CoopMemberViewModel } from "../models/coop-member-view.model";


export class CoopMemberService extends CdService {
    b: BaseService;
    cdToken: string;
    serviceModel: CoopMemberModel;
    srvSess: SessionService;
    validationCreateParams;

    /*
     * create rules
     */
    cRules = {
        required: [
            'memberGuid',
            'groupGuidParent',
            'cdObjTypeId',
        ],
        noDuplicate: [
            'memberGuid',
            'groupGuidParent'
        ],
    };

    constructor() {
        super()
        this.b = new BaseService();
        this.serviceModel = new CoopMemberModel();
        this.srvSess = new SessionService();
    }

    ///////////////
    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "CoopMember",
            "a": "Create",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "userIdMember": "1010",
                            "memberGuid": "fe5b1a9d-df45-4fce-a181-65289c48ea00",
                            "groupGuidParent": "D7FF9E61-B143-D083-6130-A51058AD9630",
                            "cdObjTypeId": "9"
                        }
                    },
                    {
                        "data": {
                            "userIdMember": "1015",
                            "memberGuid": "fe5b1a9d-df45-4fce-a181-65289c48ea00",
                            "groupGuidParent": "2cdaba03-5121-11e7-b279-c04a002428aa",
                            "cdObjTypeId": "9"
                        }
                    }
                ],
                "token": "6E831EAF-244D-2E5A-0A9E-27C1FDF7821D"
            },
            "args": null
        }
     * @param req
     * @param res
     */
    async create(req, res) {
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = { serviceModel: CoopMemberModel, serviceModelInstance: this.serviceModel, docName: 'Create group-member', dSource: 1 };
            console.log('CoopMemberService::create()/req.post:', req.post)
            const result = await this.b.create(req, res, serviceInput);
            await this.afterCreate(req, res);
            await this.b.successResponse(req, res, result, svSess)
        } else {
            await this.b.respond(req, res);
        }
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'groupMemberGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'groupMemberEnabled', value: true });
        return true;
    }

    async afterCreate(req, res) {
        const svSess = new SessionService()
        // flag invitation group as accepted
        await this.b.setAlertMessage('new group-member created', svSess, true);
    }

    async createI(req, res, createIParams: CreateIParams): Promise<CoopMemberModel | boolean> {
        // const svSess = new SessionService()
        // if (this.validateCreateI(req, res, createIParams)) {
        //     return await this.b.createI(req, res, createIParams)
        // } else {
        //     this.b.setAlertMessage(`could not join group`, svSess, false);
        // }
        return await this.b.createI(req, res, createIParams)
    }

    async validateCreateI(req, res, createIParams: CreateIParams) {
        console.log('CoopMemberService::validateCreateI()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        console.log('CoopMemberService::validateCreateI()/011')
        this.b.i.code = 'CoopMemberService::validateCreateI';
        let ret = false;
        this.validationCreateParams = {
            controllerInstance: this,
            model: CoopMemberModel,
            data: createIParams.controllerData
        }
        // const isUnique = await this.validateUniqueMultiple(req, res, this.validationCreateParams)
        // await this.b.validateUnique(req, res, this.validationCreateParams)
        if (await this.b.validateUniqueI(req, res, this.validationCreateParams)) {
            console.log('CoopMemberService::validateCreateI()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('CoopMemberService::validateCreateI()/03')
                ///////////////////////////////////////////////////////////////////
                // // 2. confirm the consumerTypeGuid referenced exists
                const pl: CoopMemberModel = createIParams.controllerData;
                let cdObjType: CdObjTypeModel[];
                let q: any = { where: { cdObjTypeId: pl.cdObjTypeId } };
                let serviceInput: IServiceInput = {
                    serviceModel: CdObjTypeModel,
                    modelName: "CdObjTypeModel",
                    docName: 'CoopMemberService::validateCreateI',
                    cmd: {
                        action: 'find',
                        query: q
                    },
                    dSource: 1
                }
                if ('cdObjTypeId' in pl) {
                    console.log('CoopMemberService::validateCreateI()/04')
                    cdObjType = await this.b.get(req, res, serviceInput)
                    ret = await this.b.validateInputRefernce(`cdobj type reference is invalid`, cdObjType, svSess)
                } else {
                    console.log('CoopMemberService::validateCreateI()/04')
                    this.b.setAlertMessage(`groupGuidParent is missing in payload`, svSess, false);
                }
                if ('memberGuid' in pl) {
                    console.log('CoopMemberService::validateCreateI()/05')
                    if (cdObjType[0].cdObjTypeName === 'group') {
                        console.log('CoopMemberService::validateCreateI()/06')
                        q = { where: { groupGuid: pl.memberGuid } };
                        serviceInput.cmd.query = q;
                        const group: GroupModel[] = await this.b.get(req, res, serviceInput);
                        ret = await this.b.validateInputRefernce(`member reference is invalid`, group, svSess)
                    }
                    if (cdObjType[0].cdObjTypeName === 'user') {
                        console.log('CoopMemberService::validateCreateI()/04')
                        q = { where: { userGuid: pl.memberGuid } };
                        serviceInput.cmd.query = q;
                        const user: UserModel[] = await this.b.get(req, res, serviceInput);
                        if (user.length > 0) {
                            console.log('CoopMemberService::validateCreateI()/05')
                            this.b.setPlData(req, { key: 'userIdMember', value: user[0].userId });
                            ret = await this.b.validateInputRefernce(`member reference is invalid`, user, svSess)
                        } else {
                            console.log('CoopMemberService::validateCreateI()/06')
                            ret = await this.b.validateInputRefernce(`member reference is invalid`, user, svSess)
                        }
                        console.log('CoopMemberService::validateCreateI()/07')
                    }
                } else {
                    console.log('moduleman/CoopMemberService::validateCreateI()/11')
                    this.b.setAlertMessage(`memberGuid is missing in payload`, svSess, false);
                }
                if ('groupGuidParent' in pl) {
                    console.log('CoopMemberService::validateCreateI()/08')
                    console.log('CoopMemberService::validateCreateI()/q:', q)
                    q = { where: { groupGuid: pl.groupGuidParent } };
                    serviceInput.cmd.query = q;
                    const r: GroupModel[] = await this.b.get(req, res, serviceInput);
                    console.log('CoopMemberService::validateCreateI()/09')
                    ret = await this.b.validateInputRefernce(`parent reference is invalid`, r, svSess)
                } else {
                    console.log('CoopMemberService::validateCreateI()/10')
                    this.b.setAlertMessage(`groupGuidParent is missing in payload`, svSess, false);
                }
                if (this.b.err.length > 0) {
                    console.log('CoopMemberService::validateCreateI()/11')
                    ret = false;
                }
            } else {
                console.log('CoopMemberService::validateCreateI()/12')
                ret = false;
                this.b.setAlertMessage(`the required fields ${this.b.isInvalidFields.join(', ')} is missing`, svSess, true);
            }
        } else {
            console.log('CoopMemberService::validateCreateI()/13')
            ret = false;
            this.b.setAlertMessage(`duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`, svSess, false);
        }
        console.log('CoopMemberService::validateCreateI()/14')
        console.log('CoopMemberService::validateCreateI()/ret', ret)
        return ret;
    }

    async groupMemberExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CoopMemberModel,
            docName: 'CoopMemberService::group-memberExists',
            cmd: {
                action: 'find',
                query: { where: params.filter }
            },
            dSource: 1,
        }
        return this.b.read(req, res, serviceInput)
    }

    async read(req, res, serviceInput: IServiceInput): Promise<any> {
        //
    }

    update(req, res) {
        // console.log('CoopMemberService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopMemberModel,
            docName: 'CoopMemberService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('CoopMemberService::update()/02')
        this.b.update$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.groupMemberEnabled === '') {
            q.update.groupMemberEnabled = null;
        }
        return q;
    }

    async remove(req, res) {
        //
    }

    /**
     * methods for transaction rollback
     */
    rbCreate(): number {
        return 1;
    }

    rbUpdate(): number {
        return 1;
    }

    rbDelete(): number {
        return 1;
    }

    async validateCreate(req, res) {
        console.log('CoopMemberService::validateCreate()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        console.log('CoopMemberService::validateCreate()/011')
        this.b.i.code = 'CoopMemberService::validateCreate';
        let ret = false;
        this.validationCreateParams = {
            controllerInstance: this,
            model: CoopMemberModel,
        }
        // const isUnique = await this.validateUniqueMultiple(req, res, this.validationCreateParams)
        // await this.b.validateUnique(req, res, this.validationCreateParams)
        if (await this.b.validateUnique(req, res, this.validationCreateParams)) {
            console.log('CoopMemberService::validateCreate()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('CoopMemberService::validateCreate()/03')
                ///////////////////////////////////////////////////////////////////
                // // 2. confirm the consumerTypeGuid referenced exists
                const pl: CoopMemberModel = await this.b.getPlData(req);
                let cdObjType: CdObjTypeModel[];
                let q: any = { where: { cdObjTypeId: pl.cdObjTypeId } };
                let serviceInput: IServiceInput = {
                    serviceModel: CdObjTypeModel,
                    modelName: "CdObjTypeModel",
                    docName: 'CoopMemberService::validateCreate',
                    cmd: {
                        action: 'find',
                        query: q
                    },
                    dSource: 1
                }
                if ('cdObjTypeId' in pl) {
                    console.log('CoopMemberService::validateCreate()/04')
                    cdObjType = await this.b.get(req, res, serviceInput)
                    ret = await this.b.validateInputRefernce(`cdobj type reference is invalid`, cdObjType, svSess)
                } else {
                    console.log('CoopMemberService::validateCreate()/05')
                    this.b.setAlertMessage(`groupGuidParent is missing in payload`, svSess, false);
                }
                if ('memberGuid' in pl) {
                    console.log('CoopMemberService::validateCreate()/06')

                    q = { where: { groupGuid: pl.memberGuid } };
                    serviceInput.serviceModel = GroupModel;
                    serviceInput.cmd.query = q;
                    if (cdObjType[0].cdObjTypeName === 'group') {
                        console.log('CoopMemberService::validateCreate()/07')
                        const group: GroupModel[] = await this.b.get(req, res, serviceInput);
                        ret = await this.b.validateInputRefernce(`member reference is invalid`, group, svSess)
                    }
                    if (cdObjType[0].cdObjTypeName === 'user') {
                        console.log('CoopMemberService::validateCreate()/08')
                        console.log('CoopMemberService::validateCreate()/serviceInput:', serviceInput)
                        /**
                         * confirm if user exists
                         */
                        const pl: CoopMemberModel = this.b.getPlData(req);
                        console.log('CoopMemberService::validateCreate()/pl:', pl)
                        // const userServiceInput: IServiceInput = {
                        //     serviceModel: new UserModel(),
                        //     modelName: 'UserModel',
                        //     docName: 'CoopMemberService::validateCreate',
                        //     cmd: { action: 'find', query: { where: { userId: pl.userIdMember} } },
                        //     dSource: 1
                        // }
                        // console.log('CoopMemberService::validateCreate()/userServiceInput:', userServiceInput)
                        // // serviceInput.serviceModel = UserModel
                        // const user: UserModel[] = await this.b.get(req, res, userServiceInput);
                        const svUser = new UserService();
                        const user = await svUser.getUserByID(req, res, pl.userIdMember)
                        console.log('CoopMemberService::validateCreate()/user:', user)
                        if (user.length > 0) {
                            console.log('CoopMemberService::validateCreate()/09')
                            this.b.setPlData(req, { key: 'userIdMember', value: user[0].userId });
                            ret = await this.b.validateInputRefernce(`member reference is invalid`, user, svSess)
                        } else {
                            console.log('CoopMemberService::validateCreate()/10')
                            ret = await this.b.validateInputRefernce(`member reference is invalid`, user, svSess)
                        }
                        console.log('CoopMemberService::validateCreate()/11')
                    }
                } else {
                    console.log('moduleman/CoopMemberService::validateCreate()/12')
                    this.b.setAlertMessage(`memberGuid is missing in payload`, svSess, false);
                }
                if ('groupGuidParent' in pl) {
                    console.log('CoopMemberService::validateCreate()/13')
                    const groupServiceInput: IServiceInput = {
                        serviceModel: GroupModel,
                        modelName: 'GroupModel',
                        docName: 'CoopMemberService::validateCreate',
                        cmd: { action: 'find', query: { where: { groupGuid: pl.groupGuidParent } } },
                        dSource: 1
                    }
                    // const q: IQuery = { where: { groupGuid: pl.groupGuidParent } };

                    // console.log('CoopMemberService::validateCreate()/q:', q)
                    // serviceInput.serviceModel = GroupModel
                    const group: GroupModel[] = await this.b.get(req, res, groupServiceInput);
                    console.log('CoopMemberService::validateCreate()/14')
                    console.log('CoopMemberService::validateCreate()/group:', group)
                    if(group.length < 1){
                        ret = await this.b.validateInputRefernce(`parent reference is invalid`, group, svSess)
                    }
                } else {
                    console.log('CoopMemberService::validateCreate()/15')
                    this.b.setAlertMessage(`groupGuidParent is missing in payload`, svSess, false);
                }
                if (this.b.err.length > 0) {
                    console.log('CoopMemberService::validateCreate()/16')
                    ret = false;
                }
            } else {
                console.log('CoopMemberService::validateCreate()/17')
                ret = false;
                this.b.setAlertMessage(`the required fields ${this.b.isInvalidFields.join(', ')} is missing`, svSess, true);
            }
        } else {
            console.log('CoopMemberService::validateCreate()/18')
            ret = false;
            this.b.setAlertMessage(`duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`, svSess, false);
        }
        console.log('CoopMemberService::validateCreate()/19')
        console.log('CoopMemberService::validateCreate()/ret', ret)
        return ret;
    }

    // async validateUniqueMultiple(req, res){
    //     let stateArr = [];
    //     let buFVals = req.post.dat.f_vals
    //     console.log('CoopMemberService::validateUniqueMultiple()/buFVals1:', buFVals)
    //     await buFVals.forEach(async (plFVals, fValsIndex) => {
    //         console.log('CoopMemberService::validateUniqueMultiple()/fValsIndex:', fValsIndex)
    //         console.log('CoopMemberService::validateUniqueMultiple()/plFVals12:', plFVals)
    //         // set the req
    //         req.post.dat.f_vals[0] = plFVals
    //         console.log('CoopMemberService::validateUniqueMultiple()/req.post.dat.f_vals[0]:', req.post.dat.f_vals[0])
    //         const isUnq = await this.b.validateUnique(req, res, this.validationCreateParams)
    //         console.log('CoopMemberService::validateUniqueMultiple()/isUnq:', isUnq)
    //         const state = {
    //             index: fValsIndex,
    //             isUnique: isUnq
    //         }
    //         console.log('CoopMemberService::validateUniqueMultiple()/state:', state)
    //         stateArr.push(state)
    //     })
    //     console.log('CoopMemberService::validateUniqueMultiple()/stateArr1:', stateArr)
    //     // get valid FVal items
    //     // const validStateArr = stateArr.filter((state) => state.isUnique)
    //     // stateArr.forEach((state,i) => {
    //     //     if(state.isUnique === false){
    //     //         console.log('CoopMemberService::validateUniqueMultiple()/stateArr2:', stateArr)
    //     //         buFVals.splice(i, 1); 
    //     //         console.log('CoopMemberService::validateUniqueMultiple()/stateArr3:', stateArr)
    //     //     }
    //     // })
    //     buFVals = buFVals.filter((fVals,i) => stateArr[i].isUnigue)
    //     console.log('CoopMemberService::validateUniqueMultiple()/buFVals2:', buFVals)
    //     // restor fVals...but only with valid items
    //     req.post.dat.f_vals = buFVals;
    //     if(buFVals.length > 0){
    //         return true;
    //     } else {
    //         return false;
    //     }

    // }

    /**
     * $members = mCoopMember::getCoopMember2([$filter1, $filter2], $usersOnly)
     * @param req 
     * @param res 
     * @param q 
     */
    async getCoopMember(req, res, q: IQuery = null) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CoopMemberService::getCoopMember/f:', q);
        const serviceInput = {
            serviceModel: CoopMemberViewModel,
            docName: 'CoopMemberService::getCoopMember$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('CoopMemberService::read$()/r:', r)
                    this.b.i.code = 'CoopMemberController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('CoopMemberService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getCoopMemberCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('CoopMemberService::getCoopMemberCount/q:', q);
        const serviceInput = {
            serviceModel: CoopMemberViewModel,
            docName: 'CoopMemberService::getCoopMemberCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'CoopMemberController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res)
            })
    }

    delete(req, res) {
        const q = this.b.getQuery(req);
        console.log('CoopMemberService::delete()/q:', q)
        const serviceInput = {
            serviceModel: CoopMemberModel,
            docName: 'CoopMemberService::delete',
            cmd: {
                action: 'delete',
                query: q
            },
            dSource: 1
        }
        this.b.delete$(req, res, serviceInput)
            .subscribe((ret) => {
                this.b.cdResp.data = ret;
                this.b.respond(req, res)
            })
    }

    getPals(cuid) {
        return [{}];
    }

    getCoopMembers(moduleGroupGuid) {
        return [{}];
    }

    getMembershipGroups(cuid) {
        return [{}];
    }

    async isMember(req, res, params): Promise<boolean> {
        console.log('starting CoopMemberService::isMember(req, res, data)');
        const entityManager = getManager();
        const opts = { where: params };
        const result = await entityManager.count(CoopMemberModel, opts);
        if (result > 0) {
            return true;
        } else {
            return false;
        }
    }

    getActionGroups(menuAction) {
        return [{}];
    }

    async getUserGroups(ret) {
        //
    }

}