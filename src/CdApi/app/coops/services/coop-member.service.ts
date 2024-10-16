import { getManager } from "typeorm";
import { BaseService } from "../../../sys/base/base.service";
import { CdService } from "../../../sys/base/cd.service";
import { CreateIParams, IQuery, IServiceInput, ISessionDataExt } from "../../../sys/base/IBase";
import { CdObjTypeModel } from "../../../sys/moduleman/models/cd-obj-type.model";
import { GroupModel } from "../../../sys/user/models/group.model";
import { IUserProfile, profileDefaultConfig, UserModel, userProfileDefault } from "../../../sys/user/models/user.model";
import { SessionService } from "../../../sys/user/services/session.service";
import { UserService } from "../../../sys/user/services/user.service";
import { CoopMemberModel, ICoopMemberProfile } from "../models/coop-member.model";
import { CoopMemberViewModel } from "../models/coop-member-view.model";
import { CoopModel } from "../models/coop.model";
import { CoopMemberTypeModel } from "../models/coop-member-type.model";
import { Logging } from "../../../sys/base/winston.log";


export class CoopMemberService extends CdService {
    logger: Logging;
    b: BaseService;
    cdToken: string;
    serviceModel: CoopMemberModel;
    srvSess: SessionService;
    validationCreateParams;
    mergedProfile: ICoopMemberProfile;

    /*
     * create rules
     */
    cRules = {
        required: [
            'userId',
            'coopId',
            'coopMemberTypeId'
        ],
        noDuplicate: [
            'userId',
            'coopId',
            'coopMemberTypeId'
        ],
    };

    constructor() {
        super()
        this.logger = new Logging();
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
        const fValsArray = req.body.dat.f_vals || []; // Get the f_vals array
        const results = [];

        for (let fVal of fValsArray) {
            req.body.dat.f_vals = [fVal];  // Set current fVal as a single object in the array

            if (await this.validateCreate(req, res)) {
                await this.beforeCreate(req, res);
                const serviceInput = {
                    serviceModel: CoopMemberModel,
                    serviceModelInstance: this.serviceModel,
                    docName: 'Create coop-member',
                    dSource: 1
                };
                console.log('CoopMemberService::create()/req.post:', req.post);
                const respData = await this.b.create(req, res, serviceInput);
                console.log('CoopMemberService::create()/respData:', respData);

                // Store the result for this fVal
                results.push(respData);
            } else {
                // If validation fails, push the error state
                results.push({ success: false, message: `Validation failed for userId: ${fVal.userId}` });
            }
        }

        // Combine the responses from all f_vals creations
        this.b.i.app_msg = 'Coop members processed';
        this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = results;
        await this.b.respond(req, res);
    }

    async validateCreate(req, res) {
        const svSess = new SessionService();
        let pl: CoopMemberModel = this.b.getPlData(req);
        console.log("CoopMemberService::validateCreate()/pl:", pl);

        // Validation params for the different checks
        const validationParams = [
            {
                field: 'userId',
                query: { userId: pl.userId },
                model: UserModel
            },
            {
                field: 'coopId',
                query: { coopId: pl.coopId },
                model: CoopModel
            },
            {
                field: 'coopMemberTypeId',
                query: { coopMemberTypeId: pl.coopMemberTypeId },
                model: CoopMemberTypeModel
            }
        ];

        const valid = await this.validateExistence(req, res, validationParams);
        console.log("CoopMemberService::validateCreate/this.b.err1:", JSON.stringify(this.b.err));

        if (!valid) {
            this.logger.logInfo('coop/CoopMemberService::validateCreate()/Validation failed');
            await this.b.setAppState(false, this.b.i, svSess.sessResp);
            return false;
        }

        // Validate against duplication and required fields
        this.validationCreateParams = {
            controllerInstance: this,
            model: CoopMemberModel,
        };

        if (await this.b.validateUnique(req, res, this.validationCreateParams)) {
            if (await this.b.validateRequired(req, res, this.cRules)) {
                return true;
            } else {
                this.b.setAlertMessage(`Missing required fields: ${this.b.isInvalidFields.join(', ')}`, svSess, true);
                return false;
            }
        } else {
            this.b.setAlertMessage(`Duplicate entry for ${this.cRules.noDuplicate.join(', ')}`, svSess, false);
            return false;
        }
    }



    async validateExistence(req, res, validationParams) {
        const promises = validationParams.map(param => {
            const serviceInput = {
                serviceModel: param.model,
                docName: `CoopMemberService::validateExistence(${param.field})`,
                cmd: {
                    action: 'find',
                    query: { where: param.query }
                },
                dSource: 1
            };
            console.log("CoopMemberService::validateExistence/param.model:", param.model);
            console.log("CoopMemberService::validateExistence/serviceInput:", JSON.stringify(serviceInput));
            const b = new BaseService();
            return b.read(req, res, serviceInput).then(r => {
                if (r.length > 0) {
                    this.logger.logInfo(`coop/CoopMemberService::validateExistence() - ${param.field} exists`);
                    return true;
                } else {
                    this.logger.logError(`coop/CoopMemberService::validateExistence() - Invalid ${param.field}`);
                    this.b.i.app_msg = `${param.field} reference is invalid`;
                    this.b.err.push(this.b.i.app_msg);
                    console.log("CoopMemberService::validateExistence/this.b.err1:", JSON.stringify(this.b.err))
                    return false;
                }
            });
        });

        const results = await Promise.all(promises);
        console.log("CoopMemberService::validateExistence/results:", results)
        console.log("CoopMemberService::validateExistence/this.b.err2:", JSON.stringify(this.b.err))
        // If any of the validations fail, return false
        return results.every(result => result === true);
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'coopMemberGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'coopMemberEnabled', value: true });
        return true;
    }

    async afterCreate(req, res) {
        const svSess = new SessionService()
        // flag invitation group as accepted
        await this.b.setAlertMessage('new coop-member created', svSess, true);
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

    async coopMemberExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: CoopMemberModel,
            docName: 'CoopMemberService::coop-memberExists',
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

    async activateCoop(req, res) {
        try {
            if(!this.validateActiveCoop(req, res)){
                const e = "could not validate the request"
                this.b.err.push(e.toString());
                const i = {
                    messages: this.b.err,
                    code: 'CoopMemberService:activateCoop',
                    app_msg: ''
                };
                await this.b.serviceErr(req, res, e, i.code)
                await this.b.respond(req, res)
            }
            let pl: CoopMemberModel = this.b.getPlData(req);
            console.log("CoopMemberService::activateCoop()/pl:", pl)
            const coopId = pl.coopId
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
            console.log("CoopMemberService::activateCoop()/sessionDataExt:", sessionDataExt)
            // set all coops to inactive
            const serviceInputDeactivate = {
                serviceModel: CoopMemberModel,
                docName: 'CoopMemberService::activateCoop',
                cmd: {
                    action: 'activateCoop',
                    query: {
                        update: { coopActive: false },
                        where: { userId: sessionDataExt.currentUser.userId }
                    },
                },
                dSource: 1
            }
            const retDeactivate = await this.updateI(req, res, serviceInputDeactivate)
            console.log("CoopMemberService::activateCoop()/retDeactivate:", retDeactivate)
            // set only one coop to true
            const serviceInputActivate = {
                serviceModel: CoopMemberModel,
                docName: 'CoopMemberService::activateCoop',
                cmd: {
                    action: 'activateCoop',
                    query: {
                        update: { coopActive: true },
                        where: { userId: sessionDataExt.currentUser.userId, coopId: coopId }
                    },
                },
                dSource: 1
            }
            const retActivate = await this.updateI(req, res, serviceInputActivate)
            console.log("CoopMemberService::activateCoop()/retActivate:", retActivate)
            this.b.cdResp.data = {
                coopCoopMemberProfile: await this.getCoopMemberProfileI(req, res)
            };
            this.b.respond(req, res)
        } catch (e) {
            console.log('CoopMemberService::activateCoop()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopMemberService:activateCoop',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async validateActiveCoop(req, res){
        return true
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

    async updateI(req, res, serviceInput: IServiceInput) {
        return await this.b.update(req, res, serviceInput)
    }

    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q: any) {
        if (q.update.coopMemberEnabled === '') {
            q.update.coopMemberEnabled = null;
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
            console.log('CoopMemberService::getCoopMember()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopMemberService:getCoopMember',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getCoopMemberProfile(req, res) {
        try {
            if(!this.validateGetCoopMemberProfile(req, res)){
                const e = "could not validate the request"
                this.b.err.push(e.toString());
                const i = {
                    messages: this.b.err,
                    code: 'CoopMemberService:activateCoop',
                    app_msg: ''
                };
                await this.b.serviceErr(req, res, e, i.code)
                await this.b.respond(req, res)
            }
            await this.setCoopMemberProfileI(req, res)
            this.b.i.code = 'CoopMemberController::getCoopMemberProfile';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = this.mergedProfile;
            this.b.respond(req, res)
        } catch (e) {
            console.log('CoopMemberService::getCoopMemberProfile()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopMemberService:getCoopMemberProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async validateGetCoopMemberProfile(req, res){
        return true
    }

    async getCoopMemberProfileI(req, res) {
        try {
            await this.setCoopMemberProfileI(req, res)
            return this.mergedProfile
        } catch (e) {
            console.log('CoopMemberService::getCoopMemberProfileI()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopmemberService:getCoopMemberProfileI',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null
        }
    }

    async getCoopMemberI(req, res, q: IQuery = null): Promise<CoopMemberViewModel[]> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('CoopMemberService::getCoopMember/q:', q);
        const serviceInput = {
            serviceModel: CoopMemberViewModel,
            docName: 'CoopMemberService::getCoopMemberI',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            return await this.b.read(req, res, serviceInput)
        } catch (e) {
            console.log('CoopMemberService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopMemberService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null;
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

    async setCoopMemberProfileI(req, res) {
        console.log("CoopMemberService::setCoopMemberProfileI()/01")
        // note that 'ignoreCache' is set to true because old data may introduce confussion
        const svSess = new SessionService()
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
        console.log("CoopMemberService::setCoopMemberProfileI()/sessionDataExt:", sessionDataExt)

        //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.
        //   hint:
        console.log("CoopMemberService::setCoopMemberProfileI()/02")
        const svUser = new UserService();
        const existingUserProfile = await svUser.existingUserProfile(req, res, sessionDataExt.currentUser.userId)
        console.log("CoopMemberService::setCoopMemberProfileI()/existingUserProfile:", existingUserProfile)
        let modifiedUserProfile;

        if (await svUser.validateProfileData(req, res, existingUserProfile)) {
            console.log("CoopMemberService::setCoopMemberProfileI()/03")
            // merge coopMemberProfile data
            this.mergedProfile = await this.mergeUserProfile(req, res, existingUserProfile)
            console.log("CoopMemberService::setCoopMemberProfileI()/this.mergedProfile1:", this.mergedProfile)
        } else {
            console.log("CoopMemberService::setCoopMemberProfileI()/04")
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
            const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
            userProfileDefault.userData = filteredUserData;
            console.log("CoopMemberService::setCoopMemberProfileI()/userProfileDefault:", userProfileDefault)
            // use default, assign the userId
            profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId
            modifiedUserProfile = await svUser.modifyUserProfile(userProfileDefault, profileDefaultConfig)
            console.log("CoopMemberService::setCoopMemberProfileI()/modifiedUserProfile:", modifiedUserProfile)
            this.mergedProfile = await this.mergeUserProfile(req, res, modifiedUserProfile)
            console.log("CoopMemberService::setCoopMemberProfile()/this.mergedProfile2:", this.mergedProfile)
        }
    }

    async mergeUserProfile(req, res, userProfile): Promise<ICoopMemberProfile> {
        console.log("CoopMemberService::mergeUserProfile()/01")
        const svSess = new SessionService()
        console.log("CoopMemberService::mergeUserProfile()/02")
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
        console.log("CoopMemberService::mergeUserProfile()/03")
        const q = { where: { userId: sessionDataExt.currentUser.userId } }
        console.log("CoopMemberService::mergeUserProfile()/q:", q)
        const coopMemberData = await this.getCoopMemberI(req, res, q)
        console.log("CoopMemberService::mergeUserProfile()/coopMemberData:", coopMemberData)
        const mergedProfile: ICoopMemberProfile = {
            userProfile: userProfile,
            coopMemberData: coopMemberData
        }
        return await mergedProfile
    }

}