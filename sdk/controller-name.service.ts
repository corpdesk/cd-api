import { getManager } from "typeorm";
import { BaseService } from "../../../sys/base/base.service";
import { CdService } from "../../../sys/base/cd.service";
import { CreateIParams, IQuery, IServiceInput, ISessionDataExt } from "../../../sys/base/IBase";
import { CdObjTypeModel } from "../../../sys/moduleman/models/cd-obj-type.model";
import { GroupModel } from "../../../sys/user/models/group.model";
import { IUserProfile, profileDefaultConfig, UserModel, userProfileDefault } from "../../../sys/user/models/user.model";
import { SessionService } from "../../../sys/user/services/session.service";
import { UserService } from "../../../sys/user/services/user.service";
import { EntityNameModel, coopMemberProfileDefault, CoopsAclScope, ICoopAcl, IEntityNameProfile, ICoopRole, IUserProfileOnly } from "../models/coop-member.model";
import { EntityNameViewModel } from "../models/coop-member-view.model";
import { CoopModel } from "../models/coop.model";
import { EntityNameTypeModel } from "../models/coop-member-type.model";
import { Logging } from "../../../sys/base/winston.log";
import { ProfileServiceHelper } from "../../../sys/utils/profile-service-helper";


export class EntityNameService extends CdService {
    logger: Logging;
    b: BaseService;
    cdToken: string;
    serviceModel: EntityNameModel;
    srvSess: SessionService;
    validationCreateParams;
    mergedProfile: IEntityNameProfile;

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
        this.serviceModel = new EntityNameModel();
        this.srvSess = new SessionService();
    }

    ///////////////
    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "EntityName",
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
                    serviceModel: EntityNameModel,
                    serviceModelInstance: this.serviceModel,
                    docName: 'Create coop-member',
                    dSource: 1
                };
                console.log('EntityNameService::create()/req.post:', req.post);
                const respData = await this.b.create(req, res, serviceInput);
                console.log('EntityNameService::create()/respData:', respData);

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
        let pl: EntityNameModel = this.b.getPlData(req);
        console.log("EntityNameService::validateCreate()/pl:", pl);

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
                model: EntityNameTypeModel
            }
        ];

        const valid = await this.validateExistence(req, res, validationParams);
        console.log("EntityNameService::validateCreate/this.b.err1:", JSON.stringify(this.b.err));

        if (!valid) {
            this.logger.logInfo('coop/EntityNameService::validateCreate()/Validation failed');
            await this.b.setAppState(false, this.b.i, svSess.sessResp);
            return false;
        }

        // Validate against duplication and required fields
        this.validationCreateParams = {
            controllerInstance: this,
            model: EntityNameModel,
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
                docName: `EntityNameService::validateExistence(${param.field})`,
                cmd: {
                    action: 'find',
                    query: { where: param.query }
                },
                dSource: 1
            };
            console.log("EntityNameService::validateExistence/param.model:", param.model);
            console.log("EntityNameService::validateExistence/serviceInput:", JSON.stringify(serviceInput));
            const b = new BaseService();
            return b.read(req, res, serviceInput).then(r => {
                if (r.length > 0) {
                    this.logger.logInfo(`coop/EntityNameService::validateExistence() - ${param.field} exists`);
                    return true;
                } else {
                    this.logger.logError(`coop/EntityNameService::validateExistence() - Invalid ${param.field}`);
                    this.b.i.app_msg = `${param.field} reference is invalid`;
                    this.b.err.push(this.b.i.app_msg);
                    console.log("EntityNameService::validateExistence/this.b.err1:", JSON.stringify(this.b.err))
                    return false;
                }
            });
        });

        const results = await Promise.all(promises);
        console.log("EntityNameService::validateExistence/results:", results)
        console.log("EntityNameService::validateExistence/this.b.err2:", JSON.stringify(this.b.err))
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

    async createI(req, res, createIParams: CreateIParams): Promise<EntityNameModel | boolean> {
        // const svSess = new SessionService()
        // if (this.validateCreateI(req, res, createIParams)) {
        //     return await this.b.createI(req, res, createIParams)
        // } else {
        //     this.b.setAlertMessage(`could not join group`, svSess, false);
        // }
        return await this.b.createI(req, res, createIParams)
    }

    async validateCreateI(req, res, createIParams: CreateIParams) {
        console.log('EntityNameService::validateCreateI()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        console.log('EntityNameService::validateCreateI()/011')
        this.b.i.code = 'EntityNameService::validateCreateI';
        let ret = false;
        this.validationCreateParams = {
            controllerInstance: this,
            model: EntityNameModel,
            data: createIParams.controllerData
        }
        // const isUnique = await this.validateUniqueMultiple(req, res, this.validationCreateParams)
        // await this.b.validateUnique(req, res, this.validationCreateParams)
        if (await this.b.validateUniqueI(req, res, this.validationCreateParams)) {
            console.log('EntityNameService::validateCreateI()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('EntityNameService::validateCreateI()/03')
                ///////////////////////////////////////////////////////////////////
                // // 2. confirm the consumerTypeGuid referenced exists
                const pl: EntityNameModel = createIParams.controllerData;

            } else {
                console.log('EntityNameService::validateCreateI()/12')
                ret = false;
                this.b.setAlertMessage(`the required fields ${this.b.isInvalidFields.join(', ')} is missing`, svSess, true);
            }
        } else {
            console.log('EntityNameService::validateCreateI()/13')
            ret = false;
            this.b.setAlertMessage(`duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`, svSess, false);
        }
        console.log('EntityNameService::validateCreateI()/14')
        console.log('EntityNameService::validateCreateI()/ret', ret)
        return ret;
    }

    async coopMemberExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: EntityNameModel,
            docName: 'EntityNameService::coop-memberExists',
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
            if (!this.validateActiveCoop(req, res)) {
                const e = "could not validate the request"
                this.b.err.push(e.toString());
                const i = {
                    messages: this.b.err,
                    code: 'EntityNameService:activateCoop',
                    app_msg: ''
                };
                await this.b.serviceErr(req, res, e, i.code)
                await this.b.respond(req, res)
            }
            let pl: EntityNameModel = this.b.getPlData(req);
            console.log("EntityNameService::activateCoop()/pl:", pl)
            const coopId = pl.coopId
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
            console.log("EntityNameService::activateCoop()/sessionDataExt:", sessionDataExt)
            // set all coops to inactive
            const serviceInputDeactivate = {
                serviceModel: EntityNameModel,
                docName: 'EntityNameService::activateCoop',
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
            console.log("EntityNameService::activateCoop()/retDeactivate:", retDeactivate)
            // set only one coop to true
            const serviceInputActivate = {
                serviceModel: EntityNameModel,
                docName: 'EntityNameService::activateCoop',
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
            console.log("EntityNameService::activateCoop()/retActivate:", retActivate)
            this.b.cdResp.data = {
                coopEntityNameProfile: await this.getEntityNameProfileI(req, res)
            };
            this.b.respond(req, res)
        } catch (e) {
            console.log('EntityNameService::activateCoop()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:activateCoop',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async validateActiveCoop(req, res) {
        return true
    }

    update(req, res) {
        // console.log('EntityNameService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: EntityNameModel,
            docName: 'EntityNameService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('EntityNameService::update()/02')
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
     * $members = mEntityName::getEntityName2([$filter1, $filter2], $usersOnly)
     * @param req 
     * @param res 
     * @param q 
     */
    async getEntityName(req, res, q: IQuery = null) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('EntityNameService::getEntityName/f:', q);
        const serviceInput = {
            serviceModel: EntityNameViewModel,
            docName: 'EntityNameService::getEntityName$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('EntityNameService::read$()/r:', r)
                    this.b.i.code = 'EntityNameController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('EntityNameService::getEntityName()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:getEntityName',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getEntityNameProfile(req, res) {
        try {

            if (!this.validateGetEntityNameProfile(req, res)) {
                const e = "could not validate the request"
                this.b.err.push(e.toString());
                const i = {
                    messages: this.b.err,
                    code: 'EntityNameService:getEntityNameProfile',
                    app_msg: ''
                };
                await this.b.serviceErr(req, res, e, i.code)
                await this.b.respond(req, res)
            }
            await this.setEntityNameProfileI(req, res)
            this.b.i.code = 'EntityNameController::getEntityNameProfile';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = this.mergedProfile;
            this.b.respond(req, res)
        } catch (e) {
            console.log('EntityNameService::getEntityNameProfile()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:getEntityNameProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async validateGetEntityNameProfile(req, res) {
        let ret = true
        if (req.post.a !== 'GetMemberProfile' || !('userId' in this.b.getPlData(req))) {
            ret = false
        }
        return ret
    }

    async validateUpdateEntityNameProfile(req, res) {
        let ret = true
        const plQuery = this.b.getPlQuery(req)
        if (req.post.a !== 'UpdateEntityNameProfile' || !('userId' in plQuery.where)) {
            ret = false
        }
        return ret
    }

    async getEntityNameProfileI(req, res) {
        try {
            await this.setEntityNameProfileI(req, res)
            return this.mergedProfile
        } catch (e) {
            console.log('EntityNameService::getEntityNameProfileI()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopmemberService:getEntityNameProfileI',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null
        }
    }

    async getEntityNameI(req, res, q: IQuery = null): Promise<EntityNameViewModel[]> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('EntityNameService::getEntityName/q:', q);
        const serviceInput = {
            serviceModel: EntityNameViewModel,
            docName: 'EntityNameService::getEntityNameI',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            return await this.b.read(req, res, serviceInput)
        } catch (e) {
            console.log('EntityNameService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null;
        }
    }

    async getI(req, res, q: IQuery = null): Promise<EntityNameViewModel[]> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('EntityNameService::getEntityName/q:', q);
        const serviceInput = {
            serviceModel: EntityNameViewModel,
            docName: 'EntityNameService::getEntityNameI',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            return await this.b.read(req, res, serviceInput)
        } catch (e) {
            console.log('EntityNameService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null;
        }
    }

    async getEntityNameCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('EntityNameService::getEntityNameCount/q:', q);
        const serviceInput = {
            serviceModel: EntityNameViewModel,
            docName: 'EntityNameService::getEntityNameCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'EntityNameController::Get';
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
        console.log('EntityNameService::delete()/q:', q)
        const serviceInput = {
            serviceModel: EntityNameModel,
            docName: 'EntityNameService::delete',
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

    getEntityNames(moduleGroupGuid) {
        return [{}];
    }

    getMembershipGroups(cuid) {
        return [{}];
    }

    async isMember(req, res, params): Promise<boolean> {
        console.log('starting EntityNameService::isMember(req, res, data)');
        const entityManager = getManager();
        const opts = { where: params };
        const result = await entityManager.count(EntityNameModel, opts);
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

    /**
     * Assemble components of the profile from existing or use default to setup the first time
     * @param req 
     * @param res 
     */
    async setEntityNameProfileI(req, res) {
        console.log("EntityNameService::setEntityNameProfileI()/01")

        // note that 'ignoreCache' is set to true because old data may introduce confussion
        const svSess = new SessionService()
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
        console.log("EntityNameService::setEntityNameProfileI()/sessionDataExt:", sessionDataExt)
        let uid = sessionDataExt.currentUser.userId

        //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.

        console.log("EntityNameService::setEntityNameProfileI()/02")
        /**
         * Asses if request for self or for another user
         * - if request action is 'GetMemberProfile'
         * - and 'userId' is set
         */
        console.log("EntityNameService::setEntityNameProfileI()/req.post.a", req.post.a)
        if (req.post.a === 'GetEntityNameProfile') {
            const plData = await this.b.getPlData(req)
            console.log("EntityNameService::setEntityNameProfileI()/plData:", plData)
            uid = plData.userId
            console.log("EntityNameService::setEntityNameProfileI()/uid0:", uid)
        }

        if (req.post.a === 'UpdateEntityNameProfile') {
            const plQuery = await this.b.getPlQuery(req)
            console.log("EntityNameService::setEntityNameProfileI()/plQuery:", plQuery)
            uid = plQuery.where.userId
            console.log("EntityNameService::setEntityNameProfileI()/uid0:", uid)
        }
        console.log("EntityNameService::setEntityNameProfileI()/uid1:", uid)
        const svUser = new UserService();
        const existingUserProfile = await svUser.existingUserProfile(req, res, uid)
        console.log("EntityNameService::setEntityNameProfileI()/existingUserProfile:", existingUserProfile)
        let modifiedUserProfile;

        if (await svUser.validateProfileData(req, res, existingUserProfile)) {
            console.log("EntityNameService::setEntityNameProfileI()/03")
            // merge coopMemberProfile data
            this.mergedProfile = await this.mergeUserProfile(req, res, existingUserProfile)
            console.log("EntityNameService::setEntityNameProfileI()/this.mergedProfile1:", this.mergedProfile)
        } else {
            console.log("EntityNameService::setEntityNameProfileI()/04")
            if (this.validateGetEntityNameProfile(req, res)) {
                console.log("EntityNameService::setEntityNameProfileI()/05")
                console.log("EntityNameService::setEntityNameProfile()/uid:", uid)
                const uRet = await svUser.getUserByID(req, res, uid);
                console.log("EntityNameService::setEntityNameProfile()/uRet:", uRet)
                const { password, userProfile, ...filteredUserData } = uRet[0]
                console.log("EntityNameService::setEntityNameProfile()/filteredUserData:", filteredUserData)
                userProfileDefault.userData = filteredUserData
            } else {
                console.log("EntityNameService::setEntityNameProfileI()/06")
                const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
                userProfileDefault.userData = filteredUserData;
            }

            console.log("EntityNameService::setEntityNameProfileI()/06")
            console.log("EntityNameService::setEntityNameProfileI()/userProfileDefault1:", userProfileDefault)
            console.log("EntityNameService::setEntityNameProfileI()/06-1")
            // use default, assign the userId
            profileDefaultConfig[0].value.userId = uid
            console.log("EntityNameService::setEntityNameProfileI()/07")
            console.log("EntityNameService::setEntityNameProfileI()/userProfileDefault2:", userProfileDefault)
            console.log("EntityNameService::setEntityNameProfileI()/profileDefaultConfig:", profileDefaultConfig)
            modifiedUserProfile = await svUser.modifyProfile(userProfileDefault, profileDefaultConfig)
            console.log("EntityNameService::setEntityNameProfileI()/08")
            console.log("EntityNameService::setEntityNameProfileI()/modifiedUserProfile:", modifiedUserProfile)
            this.mergedProfile = await this.mergeUserProfile(req, res, modifiedUserProfile)
            console.log("EntityNameService::setEntityNameProfile()/this.mergedProfile2:", JSON.stringify(this.mergedProfile))
        }
    }

    async resetEntityNameProfileI(req, res) {
        console.log("EntityNameService::resetEntityNameProfileI()/01")
        // note that 'ignoreCache' is set to true because old data may introduce confusion
        const svSess = new SessionService()
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
        console.log("EntityNameService::resetEntityNameProfileI()/sessionDataExt:", sessionDataExt)

        //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.
        //   hint:
        console.log("EntityNameService::resetEntityNameProfileI()/02")
        const svUser = new UserService();
        const existingUserProfile = await svUser.existingUserProfile(req, res, sessionDataExt.currentUser.userId)
        console.log("EntityNameService::resetEntityNameProfileI()/existingUserProfile:", existingUserProfile)
        let modifiedUserProfile;

        if (await svUser.validateProfileData(req, res, existingUserProfile)) {
            console.log("EntityNameService::resetEntityNameProfileI()/03")
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
            const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
            userProfileDefault.userData = filteredUserData;
            console.log("EntityNameService::resetEntityNameProfileI()/userProfileDefault:", userProfileDefault)
            // use default, assign the userId
            profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId
            modifiedUserProfile = await svUser.modifyProfile(userProfileDefault, profileDefaultConfig)
            console.log("EntityNameService::resetEntityNameProfileI()/modifiedUserProfile:", modifiedUserProfile)
            this.mergedProfile = await this.mergeUserProfile(req, res, modifiedUserProfile)
            console.log("EntityNameService::resetEntityNameProfileI()/this.mergedProfile1:", this.mergedProfile)
        } else {
            console.log("EntityNameService::resetEntityNameProfileI()/04")
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
            const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
            userProfileDefault.userData = filteredUserData;
            console.log("EntityNameService::resetEntityNameProfileI()/userProfileDefault:", userProfileDefault)
            // use default, assign the userId
            profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId
            modifiedUserProfile = await svUser.modifyProfile(userProfileDefault, profileDefaultConfig)
            console.log("EntityNameService::resetEntityNameProfileI()/modifiedUserProfile:", modifiedUserProfile)
            this.mergedProfile = await this.mergeUserProfile(req, res, modifiedUserProfile)
            console.log("EntityNameService::resetEntityNameProfileI()/this.mergedProfile2:", this.mergedProfile)
        }
    }

    async mergeUserProfile(req, res, userProfile): Promise<IEntityNameProfile> {
        console.log("EntityNameService::mergeUserProfile()/01")
        const svSess = new SessionService()
        console.log("EntityNameService::mergeUserProfile()/02")
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
        let uid = sessionDataExt.currentUser.userId
        console.log("EntityNameService::mergeUserProfile()/03")
        /**
         * Asses if request for self or for another user
         * - if request action is 'GetMemberProfile'
         */
        if (req.post.a === 'GetEntityNameProfile') {
            const plData = this.b.getPlData(req)
            uid = plData.userId
        }
        if (req.post.a === 'UpdateEntityNameProfile') {
            const plQuery = this.b.getPlQuery(req)
            uid = plQuery.where.userId
        }
        console.log("EntityNameService::mergeUserProfile()/uid:", uid)
        const q = { where: { userId: uid } }
        console.log("EntityNameService::mergeUserProfile()/q:", q)
        const coopMemberData = await this.getEntityNameI(req, res, q)
        let aclData = await this.existingEntityNameProfile(req, res, uid)
        console.log("EntityNameService::mergeUserProfile()/aclData1:", aclData)
        if (!aclData) {
            aclData = coopMemberProfileDefault.coopMembership.acl
        }
        console.log("EntityNameService::mergeUserProfile()/aclData2:", aclData)
        console.log("EntityNameService::mergeUserProfile()/coopMemberData:", coopMemberData)
        const mergedProfile: IEntityNameProfile = {
            ...userProfile,
            coopMembership: {
                acl: aclData,
                memberData: coopMemberData
            }
        }
        console.log("EntityNameService::mergeUserProfile()/mergedProfile:", mergedProfile)
        return await mergedProfile
    }


    async updateEntityNameProfile(req, res): Promise<void> {
        try {

            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
            console.log("EntityNameService::updateCurrentUserProfile()/sessionDataExt:", sessionDataExt)
            const svUser = new UserService()
            const requestQuery: IQuery = req.post.dat.f_vals[0].query;
            const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
            let modifiedEntityNameProfile: IEntityNameProfile;
            let strModifiedEntityNameProfile;
            let strUserProfile;
            let strEntityNameData;
            let strAcl;

            /**
             * extract from db and merge with user profile to form coopMemberProfile
             * 1. profile data from current user coop_member entity. 
             * 2. membership data
             */
            await this.setEntityNameProfileI(req, res)

            if (await this.validateProfileData(req, res, this.mergedProfile)) {
                /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
                console.log("EntityNameService::updateEntityNameProfile()/01")
                console.log("EntityNameService::updateEntityNameProfile()/jsonUpdate:", jsonUpdate)
                modifiedEntityNameProfile = await svUser.modifyProfile(this.mergedProfile, jsonUpdate)
                console.log("EntityNameService::updateEntityNameProfile()/strUserProfile1:", modifiedEntityNameProfile)



                // modified profile
                strModifiedEntityNameProfile = JSON.stringify(modifiedEntityNameProfile)
                console.log("EntityNameService::updateEntityNameProfile()/strModifiedEntityNameProfile:", strModifiedEntityNameProfile)
                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strEntityNameData = JSON.stringify(modifiedEntityNameProfile.coopMembership.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedEntityNameProfile.coopMembership.acl)

            } else {
                /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
                console.log("EntityNameService::updateEntityNameProfile()/021")
                const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
                userProfileDefault.userData = filteredUserData;
                console.log("EntityNameService::updateEntityNameProfile()/userProfileDefault:", userProfileDefault)
                modifiedEntityNameProfile = await svUser.modifyProfile(userProfileDefault, jsonUpdate)
                console.log("EntityNameService::updateEntityNameProfile()/modifiedEntityNameProfile2:", modifiedEntityNameProfile)
                // strEntityNameData = JSON.stringify(modifiedEntityNameProfile)
                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strEntityNameData = JSON.stringify(modifiedEntityNameProfile.coopMembership.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedEntityNameProfile.coopMembership.acl)
            }



            console.log("EntityNameService::updateEntityNameProfile()/03")
            requestQuery.update = { coopMemberProfile: strAcl }
            console.log("EntityNameService::updateEntityNameProfile()/requestQuery:", requestQuery)
            console.log("EntityNameService::updateEntityNameProfile()/strUserProfile1-0:", JSON.stringify(await modifiedEntityNameProfile))

            // update coopMemberProfile
            let serviceInput: IServiceInput = {
                serviceInstance: this,
                serviceModel: EntityNameModel,
                docName: 'EntityNameService::updateEntityNameProfile',
                cmd: {
                    query: requestQuery
                }
            };
            console.log("EntityNameService::updateEntityNameProfile()/serviceInput:", serviceInput)
            const updateEntityNameRet = await this.updateI(req, res, serviceInput)
            const newEntityNameProfile = await this.existingEntityNameProfile(req, res, sessionDataExt.currentUser.userId)
            console.log("EntityNameService::updateEntityNameProfile()/newEntityNameProfile:", newEntityNameProfile)
            let retEntityName = {
                updateRet: updateEntityNameRet,
                newProfile: newEntityNameProfile
            }

            const userUpdateQuery = {
                "update": { userProfile: strUserProfile },
                where: {
                    userId: sessionDataExt.currentUser.userId
                }
            }
            // update user
            const userServiceInput: IServiceInput = {
                serviceInstance: svUser,
                serviceModel: UserModel,
                docName: 'EntityNameService::updateEntityNameProfile',
                cmd: {
                    query: userUpdateQuery
                }
            };
            console.log("EntityNameService::updateEntityNameProfile()/userServiceInput:", userServiceInput)
            const userUpdateRet = await svUser.updateI(req, res, userServiceInput)
            const fullProfile = await this.getI(req, res, { where: { userId: sessionDataExt.currentUser.userId } })
            console.log("EntityNameService::updateEntityNameProfile()/fullProfile:", JSON.stringify(await fullProfile))
            console.log("EntityNameService::updateEntityNameProfile()/strUserProfile1-1:", JSON.stringify(await modifiedEntityNameProfile))
            const finalRet = {
                updateRet: updateEntityNameRet,
                userUpdateRet: userUpdateRet,
                newProfile: await modifiedEntityNameProfile
            }

            // Respond with the retrieved profile data
            this.b.cdResp.data = finalRet;
            return await this.b.respond(req, res);
        } catch (e) {
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:updateCurrentUserProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }

    async resetEntityNameProfile(req, res): Promise<void> {
        try {

            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
            console.log("EntityNameService::updateCurrentUserProfile()/sessionDataExt:", sessionDataExt)
            const svUser = new UserService()
            const requestQuery: IQuery = req.post.dat.f_vals[0].query;
            const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
            let modifiedEntityNameProfile: IEntityNameProfile;
            let strUserProfile;
            let strEntityNameData;
            let strAcl;

            /**
             * extract from db and merge with user profile to form coopMemberProfile
             * 1. profile data from current user coop_member entity. 
             * 2. membership data
             */
            await this.resetEntityNameProfileI(req, res)

            if (await this.validateProfileData(req, res, this.mergedProfile)) {
                /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
                console.log("EntityNameService::updateEntityNameProfile()/01")
                console.log("EntityNameService::updateEntityNameProfile()/jsonUpdate:", jsonUpdate)
                modifiedEntityNameProfile = await svUser.modifyProfile(this.mergedProfile, jsonUpdate)
                console.log("EntityNameService::updateEntityNameProfile()/strUserProfile3:", modifiedEntityNameProfile)


                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strEntityNameData = JSON.stringify(modifiedEntityNameProfile.coopMembership.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedEntityNameProfile.coopMembership.acl)

            } else {
                /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
                console.log("EntityNameService::updateEntityNameProfile()/021")
                const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
                userProfileDefault.userData = filteredUserData;
                console.log("EntityNameService::updateEntityNameProfile()/userProfileDefault:", userProfileDefault)
                modifiedEntityNameProfile = await svUser.modifyProfile(userProfileDefault, jsonUpdate)
                console.log("EntityNameService::updateEntityNameProfile()/modifiedEntityNameProfile4:", modifiedEntityNameProfile)
                // strEntityNameData = JSON.stringify(modifiedEntityNameProfile)
                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strEntityNameData = JSON.stringify(modifiedEntityNameProfile.coopMembership.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedEntityNameProfile.coopMembership.acl)
            }

            // // userProfile
            // strUserProfile = JSON.stringify(modifiedEntityNameProfile.userProfile)
            // // acl
            // strEntityNameData = JSON.stringify(modifiedEntityNameProfile.coopMembership.memberData)
            // // memberData
            // strAcl = JSON.stringify(modifiedEntityNameProfile.coopMembership.acl)

            console.log("EntityNameService::updateEntityNameProfile()/modifiedEntityNameProfile3:", modifiedEntityNameProfile)

            console.log("EntityNameService::updateEntityNameProfile()/03")
            requestQuery.update = { coopMemberProfile: strAcl }
            console.log("EntityNameService::updateEntityNameProfile()/requestQuery:", requestQuery)

            // update coopMemberProfile
            let serviceInput: IServiceInput = {
                serviceInstance: this,
                serviceModel: EntityNameModel,
                docName: 'EntityNameService::updateEntityNameProfile',
                cmd: {
                    query: requestQuery
                }
            };
            console.log("EntityNameService::updateEntityNameProfile()/serviceInput:", serviceInput)
            const updateEntityNameRet = await this.updateI(req, res, serviceInput)
            const newEntityNameProfile = await this.existingEntityNameProfile(req, res, sessionDataExt.currentUser.userId)
            let retEntityName = {
                updateRet: updateEntityNameRet,
                newProfile: newEntityNameProfile
            }

            const userUpdateQuery = {
                "update": { userProfile: strUserProfile },
                where: {
                    userId: sessionDataExt.currentUser.userId
                }
            }
            // update user
            const userServiceInput: IServiceInput = {
                serviceInstance: svUser,
                serviceModel: UserModel,
                docName: 'EntityNameService::updateEntityNameProfile',
                cmd: {
                    query: userUpdateQuery
                }
            };
            console.log("EntityNameService::updateEntityNameProfile()/userServiceInput:", userServiceInput)
            const userUpdateRet = await svUser.updateI(req, res, userServiceInput)
            const fullProfile = await this.getI(req, res, { where: { userId: sessionDataExt.currentUser.userId } })
            const finalRet = {
                updateRet: updateEntityNameRet,
                userUpdateRet: userUpdateRet,
                newProfile: modifiedEntityNameProfile
            }

            // Respond with the retrieved profile data
            this.b.cdResp.data = finalRet;
            return await this.b.respond(req, res);
        } catch (e) {
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:updateCurrentUserProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }

    async extractUserProfile() {
        // Create a new object without 'coopMembership'
        const userProfileOnly: IUserProfileOnly = { ...this.mergedProfile };

        // Remove 'coopMembership' property
        delete (userProfileOnly as any).coopMembership; // Temporarily type-cast to allow deletion

        // Now `userProfileOnly` is of type `IUserProfileOnly`, with `coopMembership` removed.
        return userProfileOnly
    }

    /////////////////////////////////////////////
    // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
    //

    async existingEntityNameProfile(req, res, cuid) {
        const si: IServiceInput = {
            serviceInstance: this,
            serviceModel: EntityNameModel,
            docName: 'EntityNameService::existingUserProfile',
            cmd: {
                query: { where: { userId: cuid } }
            },
            mapping: { profileField: "coopMemberProfile" }
        };
        return this.b.read(req, res, si);
    }

    // async modifyUserProfile(existingData, profileDefaultConfig) {
    //     return ProfileServiceHelper.modifyProfile(existingData, profileDefaultConfig, {
    //         userPermissions: 'userPermissions',
    //         groupPermissions: 'groupPermissions',
    //         userId: 'userId',
    //         groupId: 'groupId'
    //     });
    // }

    // Helper method to validate profile data
    async validateProfileData(req, res, profileData: any): Promise<boolean> {
        console.log("EntityNameService::validateProfileData()/profileData:", profileData)
        // const profileData: IUserProfile = updateData.update.userProfile
        // console.log("EntityNameService::validateProfileData()/profileData:", profileData)
        // Check if profileData is null or undefined
        if (!profileData) {
            console.log("EntityNameService::validateProfileData()/01")
            return false;
        }

        // Validate that the required fields of IUserProfile exist
        if (!profileData.fieldPermissions || !profileData.userData) {
            console.log("EntityNameService::validateProfileData()/02")
            console.log("EntityNameService::validateProfileData()/profileData.userData:", profileData.userData)
            console.log("EntityNameService::validateProfileData()/profileData.fieldPermissions:", profileData.fieldPermissions)
            return false;
        }

        // Example validation for bio length
        if (profileData.bio && profileData.bio.length > 500) {
            console.log("EntityNameService::validateProfileData()/03")
            const e = "Bio data is too long";
            this.b.err.push(e);
            const i = {
                messages: this.b.err,
                code: 'EntityNameService:validateProfileData',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            return false;  // Bio is too long
        }
        return true;
    }

    // CRUD Methods for coopRole within coopMembership
    // // Usage examples
    // const memberProfile = coopMemberProfileDefault;

    // // Add a new role
    // addCoopRole(memberProfile, -1, { scope: CoopsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 101 });

    // // Get all roles for a specific coopMembership by coopId
    // console.log(getCoopRoles(memberProfile, -1));

    // // Update an existing role
    // const updated = updateCoopRole(memberProfile, -1, CoopsAclScope.COOPS_SACCO_ADMIN, { scope: CoopsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 202 });
    // console.log('Update successful:', updated);

    // // Delete a role
    // const deleted = deleteCoopRole(memberProfile, -1, CoopsAclScope.COOPS_GUEST);
    // console.log('Delete successful:', deleted);

    /**
     * Add a new role to coopRole within a specific coopMembership identified by coopId
     * @param profile The member profile to modify
     * @param coopId The ID of the specific coopMembership
     * @param newRole The new role to add to coopRole
     */
    addCoopRole(profile: IEntityNameProfile, coopId: number, newRole: ICoopAcl): boolean {
        const memberMeta = profile.coopMembership.acl?.find(m => m.coopId === coopId);
        if (memberMeta) {
            memberMeta.coopRole.push(newRole);
            return true;
        }
        return false; // Return false if coopMembership with the given coopId was not found
    }

    /**
     * Get all coop roles from a specific coopMembership identified by coopId
     * @param profile The member profile to retrieve roles from
     * @param coopId The ID of the specific coopMembership
     * @returns An array of ICoopAcl representing all coop roles, or null if not found
     */
    getCoopRoles(profile: IEntityNameProfile, coopId: number): ICoopRole | null {
        const memberMeta = profile.coopMembership.acl?.find(m => m.coopId === coopId);
        return memberMeta ? memberMeta.coopRole : null;
    }

    /**
     * Update an existing role in coopRole within a specific coopMembership identified by coopId
     * @param profile The member profile to modify
     * @param coopId The ID of the specific coopMembership
     * @param scope The scope of the role to update
     * @param updatedRole The updated role data
     * @returns boolean indicating success or failure
     */
    updateCoopRole(profile: IEntityNameProfile, coopId: number, scope: CoopsAclScope, updatedRole: ICoopAcl): boolean {
        const memberMeta = profile.coopMembership.acl?.find(m => m.coopId === coopId);
        if (memberMeta) {
            const roleIndex = memberMeta.coopRole.findIndex(role => role.scope === scope);
            if (roleIndex !== -1) {
                memberMeta.coopRole[roleIndex] = updatedRole;
                return true;
            }
        }
        return false; // Return false if role with the given scope was not found in coopRole
    }

    /**
     * Remove a role from coopRole within a specific coopMembership identified by coopId
     * @param profile The member profile to modify
     * @param coopId The ID of the specific coopMembership
     * @param scope The scope of the role to remove
     * @returns boolean indicating success or failure
     */
    deleteCoopRole(profile: IEntityNameProfile, coopId: number, scope: CoopsAclScope): boolean {
        const memberMeta = profile.coopMembership.acl?.find(m => m.coopId === coopId);
        if (memberMeta) {
            const roleIndex = memberMeta.coopRole.findIndex(role => role.scope === scope);
            if (roleIndex !== -1) {
                memberMeta.coopRole.splice(roleIndex, 1);
                return true;
            }
        }
        return false; // Return false if role with the given scope was not found in coopRole
    }

}