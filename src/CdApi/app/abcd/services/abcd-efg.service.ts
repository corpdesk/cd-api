import { getManager } from "typeorm";
import { BaseService } from "../../../sys/base/base.service";
import { CdService } from "../../../sys/base/cd.service";
import { CreateIParams, IQuery, IServiceInput, ISessionDataExt } from "../../../sys/base/IBase";
import { CdObjTypeModel } from "../../../sys/moduleman/models/cd-obj-type.model";
import { GroupModel } from "../../../sys/user/models/group.model";
import { IUserProfile, profileDefaultConfig, UserModel, userProfileDefault } from "../../../sys/user/models/user.model";
import { SessionService } from "../../../sys/user/services/session.service";
import { UserService } from "../../../sys/user/services/user.service";
import { AbcdEfgModel, abcdEfgProfileDefault, AbcdsAclScope, IAbcdAcl, IAbcdEfgProfile, IAbcdRole, IUserProfileOnly } from "../models/abcd-efg.model";
import { AbcdEfgViewModel } from "../models/abcd-efg-view.model";
import { AbcdModel } from "../models/abcd.model";
import { AbcdEfgTypeModel } from "../models/abcd-efg-type.model";
import { Logging } from "../../../sys/base/winston.log";
import { ProfileServiceHelper } from "../../../sys/utils/profile-service-helper";


export class AbcdEfgService extends CdService {
    logger: Logging;
    b: BaseService;
    cdToken: string;
    serviceModel: AbcdEfgModel;
    srvSess: SessionService;
    validationCreateParams;
    mergedProfile: IAbcdEfgProfile;

    /*
     * create rules
     */
    cRules = {
        required: [
            'userId',
            'abcdId',
            'abcdEfgTypeId'
        ],
        noDuplicate: [
            'userId',
            'abcdId',
            'abcdEfgTypeId'
        ],
    };

    constructor() {
        super()
        this.logger = new Logging();
        this.b = new BaseService();
        this.serviceModel = new AbcdEfgModel();
        this.srvSess = new SessionService();
    }

    ///////////////
    /**
     * {
            "ctx": "Sys",
            "m": "User",
            "c": "AbcdEfg",
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
                    serviceModel: AbcdEfgModel,
                    serviceModelInstance: this.serviceModel,
                    docName: 'Create abcd-member',
                    dSource: 1
                };
                console.log('AbcdEfgService::create()/req.post:', req.post);
                const respData = await this.b.create(req, res, serviceInput);
                console.log('AbcdEfgService::create()/respData:', respData);

                // Store the result for this fVal
                results.push(respData);
            } else {
                // If validation fails, push the error state
                results.push({ success: false, message: `Validation failed for userId: ${fVal.userId}` });
            }
        }

        // Combine the responses from all f_vals creations
        this.b.i.app_msg = 'Abcd members processed';
        this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = results;
        await this.b.respond(req, res);
    }

    async validateCreate(req, res) {
        const svSess = new SessionService();
        let pl: AbcdEfgModel = this.b.getPlData(req);
        console.log("AbcdEfgService::validateCreate()/pl:", pl);

        // Validation params for the different checks
        const validationParams = [
            {
                field: 'userId',
                query: { userId: pl.userId },
                model: UserModel
            },
            {
                field: 'abcdId',
                query: { abcdId: pl.abcdId },
                model: AbcdModel
            },
            {
                field: 'abcdEfgTypeId',
                query: { abcdEfgTypeId: pl.abcdEfgTypeId },
                model: AbcdEfgTypeModel
            }
        ];

        const valid = await this.validateExistence(req, res, validationParams);
        console.log("AbcdEfgService::validateCreate/this.b.err1:", JSON.stringify(this.b.err));

        if (!valid) {
            this.logger.logInfo('abcd/AbcdEfgService::validateCreate()/Validation failed');
            await this.b.setAppState(false, this.b.i, svSess.sessResp);
            return false;
        }

        // Validate against duplication and required fields
        this.validationCreateParams = {
            controllerInstance: this,
            model: AbcdEfgModel,
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
                docName: `AbcdEfgService::validateExistence(${param.field})`,
                cmd: {
                    action: 'find',
                    query: { where: param.query }
                },
                dSource: 1
            };
            console.log("AbcdEfgService::validateExistence/param.model:", param.model);
            console.log("AbcdEfgService::validateExistence/serviceInput:", JSON.stringify(serviceInput));
            const b = new BaseService();
            return b.read(req, res, serviceInput).then(r => {
                if (r.length > 0) {
                    this.logger.logInfo(`abcd/AbcdEfgService::validateExistence() - ${param.field} exists`);
                    return true;
                } else {
                    this.logger.logError(`abcd/AbcdEfgService::validateExistence() - Invalid ${param.field}`);
                    this.b.i.app_msg = `${param.field} reference is invalid`;
                    this.b.err.push(this.b.i.app_msg);
                    console.log("AbcdEfgService::validateExistence/this.b.err1:", JSON.stringify(this.b.err))
                    return false;
                }
            });
        });

        const results = await Promise.all(promises);
        console.log("AbcdEfgService::validateExistence/results:", results)
        console.log("AbcdEfgService::validateExistence/this.b.err2:", JSON.stringify(this.b.err))
        // If any of the validations fail, return false
        return results.every(result => result === true);
    }

    async beforeCreate(req, res): Promise<any> {
        this.b.setPlData(req, { key: 'abcdEfgGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'abcdEfgEnabled', value: true });
        return true;
    }

    async afterCreate(req, res) {
        const svSess = new SessionService()
        // flag invitation group as accepted
        await this.b.setAlertMessage('new abcd-member created', svSess, true);
    }

    async createI(req, res, createIParams: CreateIParams): Promise<AbcdEfgModel | boolean> {
        // const svSess = new SessionService()
        // if (this.validateCreateI(req, res, createIParams)) {
        //     return await this.b.createI(req, res, createIParams)
        // } else {
        //     this.b.setAlertMessage(`could not join group`, svSess, false);
        // }
        return await this.b.createI(req, res, createIParams)
    }

    async validateCreateI(req, res, createIParams: CreateIParams) {
        console.log('AbcdEfgService::validateCreateI()/01')
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        console.log('AbcdEfgService::validateCreateI()/011')
        this.b.i.code = 'AbcdEfgService::validateCreateI';
        let ret = false;
        this.validationCreateParams = {
            controllerInstance: this,
            model: AbcdEfgModel,
            data: createIParams.controllerData
        }
        // const isUnique = await this.validateUniqueMultiple(req, res, this.validationCreateParams)
        // await this.b.validateUnique(req, res, this.validationCreateParams)
        if (await this.b.validateUniqueI(req, res, this.validationCreateParams)) {
            console.log('AbcdEfgService::validateCreateI()/02')
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.log('AbcdEfgService::validateCreateI()/03')
                ///////////////////////////////////////////////////////////////////
                // // 2. confirm the consumerTypeGuid referenced exists
                const pl: AbcdEfgModel = createIParams.controllerData;

            } else {
                console.log('AbcdEfgService::validateCreateI()/12')
                ret = false;
                this.b.setAlertMessage(`the required fields ${this.b.isInvalidFields.join(', ')} is missing`, svSess, true);
            }
        } else {
            console.log('AbcdEfgService::validateCreateI()/13')
            ret = false;
            this.b.setAlertMessage(`duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`, svSess, false);
        }
        console.log('AbcdEfgService::validateCreateI()/14')
        console.log('AbcdEfgService::validateCreateI()/ret', ret)
        return ret;
    }

    async abcdEfgExists(req, res, params): Promise<boolean> {
        const serviceInput: IServiceInput = {
            serviceInstance: this,
            serviceModel: AbcdEfgModel,
            docName: 'AbcdEfgService::abcd-memberExists',
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

    async activateAbcd(req, res) {
        try {
            if (!this.validateActiveAbcd(req, res)) {
                const e = "could not validate the request"
                this.b.err.push(e.toString());
                const i = {
                    messages: this.b.err,
                    code: 'AbcdEfgService:activateAbcd',
                    app_msg: ''
                };
                await this.b.serviceErr(req, res, e, i.code)
                await this.b.respond(req, res)
            }
            let pl: AbcdEfgModel = this.b.getPlData(req);
            console.log("AbcdEfgService::activateAbcd()/pl:", pl)
            const abcdId = pl.abcdId
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
            console.log("AbcdEfgService::activateAbcd()/sessionDataExt:", sessionDataExt)
            // set all abcds to inactive
            const serviceInputDeactivate = {
                serviceModel: AbcdEfgModel,
                docName: 'AbcdEfgService::activateAbcd',
                cmd: {
                    action: 'activateAbcd',
                    query: {
                        update: { abcdActive: false },
                        where: { userId: sessionDataExt.currentUser.userId }
                    },
                },
                dSource: 1
            }
            const retDeactivate = await this.updateI(req, res, serviceInputDeactivate)
            console.log("AbcdEfgService::activateAbcd()/retDeactivate:", retDeactivate)
            // set only one abcd to true
            const serviceInputActivate = {
                serviceModel: AbcdEfgModel,
                docName: 'AbcdEfgService::activateAbcd',
                cmd: {
                    action: 'activateAbcd',
                    query: {
                        update: { abcdActive: true },
                        where: { userId: sessionDataExt.currentUser.userId, abcdId: abcdId }
                    },
                },
                dSource: 1
            }
            const retActivate = await this.updateI(req, res, serviceInputActivate)
            console.log("AbcdEfgService::activateAbcd()/retActivate:", retActivate)
            this.b.cdResp.data = {
                abcdAbcdEfgProfile: await this.getAbcdEfgProfileI(req, res)
            };
            this.b.respond(req, res)
        } catch (e) {
            console.log('AbcdEfgService::activateAbcd()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:activateAbcd',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async validateActiveAbcd(req, res) {
        return true
    }

    update(req, res) {
        // console.log('AbcdEfgService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: AbcdEfgModel,
            docName: 'AbcdEfgService::update',
            cmd: {
                action: 'update',
                query: q
            },
            dSource: 1
        }
        // console.log('AbcdEfgService::update()/02')
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
        if (q.update.abcdEfgEnabled === '') {
            q.update.abcdEfgEnabled = null;
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
     * $members = mAbcdEfg::getAbcdEfg2([$filter1, $filter2], $usersOnly)
     * @param req 
     * @param res 
     * @param q 
     */
    async getAbcdEfg(req, res, q: IQuery = null) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('AbcdEfgService::getAbcdEfg/f:', q);
        const serviceInput = {
            serviceModel: AbcdEfgViewModel,
            docName: 'AbcdEfgService::getAbcdEfg$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            this.b.read$(req, res, serviceInput)
                .subscribe((r) => {
                    console.log('AbcdEfgService::read$()/r:', r)
                    this.b.i.code = 'AbcdEfgController::Get';
                    const svSess = new SessionService();
                    svSess.sessResp.cd_token = req.post.dat.token;
                    svSess.sessResp.ttl = svSess.getTtl();
                    this.b.setAppState(true, this.b.i, svSess.sessResp);
                    this.b.cdResp.data = r;
                    this.b.respond(req, res)
                })
        } catch (e) {
            console.log('AbcdEfgService::getAbcdEfg()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:getAbcdEfg',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async getAbcdEfgProfile(req, res) {
        try {

            if (!this.validateGetAbcdEfgProfile(req, res)) {
                const e = "could not validate the request"
                this.b.err.push(e.toString());
                const i = {
                    messages: this.b.err,
                    code: 'AbcdEfgService:getAbcdEfgProfile',
                    app_msg: ''
                };
                await this.b.serviceErr(req, res, e, i.code)
                await this.b.respond(req, res)
            }
            await this.setAbcdEfgProfileI(req, res)
            this.b.i.code = 'AbcdEfgController::getAbcdEfgProfile';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = this.mergedProfile;
            this.b.respond(req, res)
        } catch (e) {
            console.log('AbcdEfgService::getAbcdEfgProfile()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:getAbcdEfgProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            await this.b.respond(req, res)
        }
    }

    async validateGetAbcdEfgProfile(req, res) {
        let ret = true
        if (req.post.a !== 'GetMemberProfile' || !('userId' in this.b.getPlData(req))) {
            ret = false
        }
        return ret
    }

    async validateUpdateAbcdEfgProfile(req, res) {
        let ret = true
        const plQuery = this.b.getPlQuery(req)
        if (req.post.a !== 'UpdateAbcdEfgProfile' || !('userId' in plQuery.where)) {
            ret = false
        }
        return ret
    }

    async getAbcdEfgProfileI(req, res) {
        try {
            await this.setAbcdEfgProfileI(req, res)
            return this.mergedProfile
        } catch (e) {
            console.log('AbcdEfgService::getAbcdEfgProfileI()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdmemberService:getAbcdEfgProfileI',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null
        }
    }

    async getAbcdEfgI(req, res, q: IQuery = null): Promise<AbcdEfgViewModel[]> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('AbcdEfgService::getAbcdEfg/q:', q);
        const serviceInput = {
            serviceModel: AbcdEfgViewModel,
            docName: 'AbcdEfgService::getAbcdEfgI',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            return await this.b.read(req, res, serviceInput)
        } catch (e) {
            console.log('AbcdEfgService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null;
        }
    }

    async getI(req, res, q: IQuery = null): Promise<AbcdEfgViewModel[]> {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.log('AbcdEfgService::getAbcdEfg/q:', q);
        const serviceInput = {
            serviceModel: AbcdEfgViewModel,
            docName: 'AbcdEfgService::getAbcdEfgI',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        try {
            return await this.b.read(req, res, serviceInput)
        } catch (e) {
            console.log('AbcdEfgService::read$()/e:', e)
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:update',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code)
            return null;
        }
    }

    async getAbcdEfgCount(req, res) {
        const q = this.b.getQuery(req);
        console.log('AbcdEfgService::getAbcdEfgCount/q:', q);
        const serviceInput = {
            serviceModel: AbcdEfgViewModel,
            docName: 'AbcdEfgService::getAbcdEfgCount$',
            cmd: {
                action: 'find',
                query: q
            },
            dSource: 1
        }
        this.b.readCount$(req, res, serviceInput)
            .subscribe((r) => {
                this.b.i.code = 'AbcdEfgController::Get';
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
        console.log('AbcdEfgService::delete()/q:', q)
        const serviceInput = {
            serviceModel: AbcdEfgModel,
            docName: 'AbcdEfgService::delete',
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

    getAbcdEfgs(moduleGroupGuid) {
        return [{}];
    }

    getMembershipGroups(cuid) {
        return [{}];
    }

    async isMember(req, res, params): Promise<boolean> {
        console.log('starting AbcdEfgService::isMember(req, res, data)');
        const entityManager = getManager();
        const opts = { where: params };
        const result = await entityManager.count(AbcdEfgModel, opts);
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
    async setAbcdEfgProfileI(req, res) {
        console.log("AbcdEfgService::setAbcdEfgProfileI()/01")

        // note that 'ignoreCache' is set to true because old data may introduce confussion
        const svSess = new SessionService()
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
        console.log("AbcdEfgService::setAbcdEfgProfileI()/sessionDataExt:", sessionDataExt)
        let uid = sessionDataExt.currentUser.userId

        //     - get and clone userProfile, then get abcdEfgProfile data and append to cloned userProfile.

        console.log("AbcdEfgService::setAbcdEfgProfileI()/02")
        /**
         * Asses if request for self or for another user
         * - if request action is 'GetMemberProfile'
         * - and 'userId' is set
         */
        console.log("AbcdEfgService::setAbcdEfgProfileI()/req.post.a", req.post.a)
        if (req.post.a === 'GetAbcdEfgProfile') {
            const plData = await this.b.getPlData(req)
            console.log("AbcdEfgService::setAbcdEfgProfileI()/plData:", plData)
            uid = plData.userId
            console.log("AbcdEfgService::setAbcdEfgProfileI()/uid0:", uid)
        }

        if (req.post.a === 'UpdateAbcdEfgProfile') {
            const plQuery = await this.b.getPlQuery(req)
            console.log("AbcdEfgService::setAbcdEfgProfileI()/plQuery:", plQuery)
            uid = plQuery.where.userId
            console.log("AbcdEfgService::setAbcdEfgProfileI()/uid0:", uid)
        }
        console.log("AbcdEfgService::setAbcdEfgProfileI()/uid1:", uid)
        const svUser = new UserService();
        const existingUserProfile = await svUser.existingUserProfile(req, res, uid)
        console.log("AbcdEfgService::setAbcdEfgProfileI()/existingUserProfile:", existingUserProfile)
        let modifiedUserProfile;

        if (await svUser.validateProfileData(req, res, existingUserProfile)) {
            console.log("AbcdEfgService::setAbcdEfgProfileI()/03")
            // merge abcdEfgProfile data
            this.mergedProfile = await this.mergeUserProfile(req, res, existingUserProfile)
            console.log("AbcdEfgService::setAbcdEfgProfileI()/this.mergedProfile1:", this.mergedProfile)
        } else {
            console.log("AbcdEfgService::setAbcdEfgProfileI()/04")
            if (this.validateGetAbcdEfgProfile(req, res)) {
                console.log("AbcdEfgService::setAbcdEfgProfileI()/05")
                console.log("AbcdEfgService::setAbcdEfgProfile()/uid:", uid)
                const uRet = await svUser.getUserByID(req, res, uid);
                console.log("AbcdEfgService::setAbcdEfgProfile()/uRet:", uRet)
                const { password, userProfile, ...filteredUserData } = uRet[0]
                console.log("AbcdEfgService::setAbcdEfgProfile()/filteredUserData:", filteredUserData)
                userProfileDefault.userData = filteredUserData
            } else {
                console.log("AbcdEfgService::setAbcdEfgProfileI()/06")
                const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
                userProfileDefault.userData = filteredUserData;
            }

            console.log("AbcdEfgService::setAbcdEfgProfileI()/06")
            console.log("AbcdEfgService::setAbcdEfgProfileI()/userProfileDefault1:", userProfileDefault)
            console.log("AbcdEfgService::setAbcdEfgProfileI()/06-1")
            // use default, assign the userId
            profileDefaultConfig[0].value.userId = uid
            console.log("AbcdEfgService::setAbcdEfgProfileI()/07")
            console.log("AbcdEfgService::setAbcdEfgProfileI()/userProfileDefault2:", userProfileDefault)
            console.log("AbcdEfgService::setAbcdEfgProfileI()/profileDefaultConfig:", profileDefaultConfig)
            modifiedUserProfile = await svUser.modifyProfile(userProfileDefault, profileDefaultConfig)
            console.log("AbcdEfgService::setAbcdEfgProfileI()/08")
            console.log("AbcdEfgService::setAbcdEfgProfileI()/modifiedUserProfile:", modifiedUserProfile)
            this.mergedProfile = await this.mergeUserProfile(req, res, modifiedUserProfile)
            console.log("AbcdEfgService::setAbcdEfgProfile()/this.mergedProfile2:", JSON.stringify(this.mergedProfile))
        }
    }

    async resetAbcdEfgProfileI(req, res) {
        console.log("AbcdEfgService::resetAbcdEfgProfileI()/01")
        // note that 'ignoreCache' is set to true because old data may introduce confusion
        const svSess = new SessionService()
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
        console.log("AbcdEfgService::resetAbcdEfgProfileI()/sessionDataExt:", sessionDataExt)

        //     - get and clone userProfile, then get abcdEfgProfile data and append to cloned userProfile.
        //   hint:
        console.log("AbcdEfgService::resetAbcdEfgProfileI()/02")
        const svUser = new UserService();
        const existingUserProfile = await svUser.existingUserProfile(req, res, sessionDataExt.currentUser.userId)
        console.log("AbcdEfgService::resetAbcdEfgProfileI()/existingUserProfile:", existingUserProfile)
        let modifiedUserProfile;

        if (await svUser.validateProfileData(req, res, existingUserProfile)) {
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/03")
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
            const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
            userProfileDefault.userData = filteredUserData;
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/userProfileDefault:", userProfileDefault)
            // use default, assign the userId
            profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId
            modifiedUserProfile = await svUser.modifyProfile(userProfileDefault, profileDefaultConfig)
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/modifiedUserProfile:", modifiedUserProfile)
            this.mergedProfile = await this.mergeUserProfile(req, res, modifiedUserProfile)
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/this.mergedProfile1:", this.mergedProfile)
        } else {
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/04")
            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
            const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
            userProfileDefault.userData = filteredUserData;
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/userProfileDefault:", userProfileDefault)
            // use default, assign the userId
            profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId
            modifiedUserProfile = await svUser.modifyProfile(userProfileDefault, profileDefaultConfig)
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/modifiedUserProfile:", modifiedUserProfile)
            this.mergedProfile = await this.mergeUserProfile(req, res, modifiedUserProfile)
            console.log("AbcdEfgService::resetAbcdEfgProfileI()/this.mergedProfile2:", this.mergedProfile)
        }
    }

    async mergeUserProfile(req, res, userProfile): Promise<IAbcdEfgProfile> {
        console.log("AbcdEfgService::mergeUserProfile()/01")
        const svSess = new SessionService()
        console.log("AbcdEfgService::mergeUserProfile()/02")
        const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res)
        let uid = sessionDataExt.currentUser.userId
        console.log("AbcdEfgService::mergeUserProfile()/03")
        /**
         * Asses if request for self or for another user
         * - if request action is 'GetMemberProfile'
         */
        if (req.post.a === 'GetAbcdEfgProfile') {
            const plData = this.b.getPlData(req)
            uid = plData.userId
        }
        if (req.post.a === 'UpdateAbcdEfgProfile') {
            const plQuery = this.b.getPlQuery(req)
            uid = plQuery.where.userId
        }
        console.log("AbcdEfgService::mergeUserProfile()/uid:", uid)
        const q = { where: { userId: uid } }
        console.log("AbcdEfgService::mergeUserProfile()/q:", q)
        const abcdEfgData = await this.getAbcdEfgI(req, res, q)
        let aclData = await this.existingAbcdEfgProfile(req, res, uid)
        console.log("AbcdEfgService::mergeUserProfile()/aclData1:", aclData)
        if (!aclData) {
            aclData = abcdEfgProfileDefault.abcdEfgship.acl
        }
        console.log("AbcdEfgService::mergeUserProfile()/aclData2:", aclData)
        console.log("AbcdEfgService::mergeUserProfile()/abcdEfgData:", abcdEfgData)
        const mergedProfile: IAbcdEfgProfile = {
            ...userProfile,
            abcdEfgship: {
                acl: aclData,
                memberData: abcdEfgData
            }
        }
        console.log("AbcdEfgService::mergeUserProfile()/mergedProfile:", mergedProfile)
        return await mergedProfile
    }


    async updateAbcdEfgProfile(req, res): Promise<void> {
        try {

            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
            console.log("AbcdEfgService::updateCurrentUserProfile()/sessionDataExt:", sessionDataExt)
            const svUser = new UserService()
            const requestQuery: IQuery = req.post.dat.f_vals[0].query;
            const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
            let modifiedAbcdEfgProfile: IAbcdEfgProfile;
            let strModifiedAbcdEfgProfile;
            let strUserProfile;
            let strAbcdEfgData;
            let strAcl;

            /**
             * extract from db and merge with user profile to form abcdEfgProfile
             * 1. profile data from current user abcd_member entity. 
             * 2. membership data
             */
            await this.setAbcdEfgProfileI(req, res)

            if (await this.validateProfileData(req, res, this.mergedProfile)) {
                /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
                console.log("AbcdEfgService::updateAbcdEfgProfile()/01")
                console.log("AbcdEfgService::updateAbcdEfgProfile()/jsonUpdate:", jsonUpdate)
                modifiedAbcdEfgProfile = await svUser.modifyProfile(this.mergedProfile, jsonUpdate)
                console.log("AbcdEfgService::updateAbcdEfgProfile()/strUserProfile1:", modifiedAbcdEfgProfile)



                // modified profile
                strModifiedAbcdEfgProfile = JSON.stringify(modifiedAbcdEfgProfile)
                console.log("AbcdEfgService::updateAbcdEfgProfile()/strModifiedAbcdEfgProfile:", strModifiedAbcdEfgProfile)
                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strAbcdEfgData = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.acl)

            } else {
                /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
                console.log("AbcdEfgService::updateAbcdEfgProfile()/021")
                const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
                userProfileDefault.userData = filteredUserData;
                console.log("AbcdEfgService::updateAbcdEfgProfile()/userProfileDefault:", userProfileDefault)
                modifiedAbcdEfgProfile = await svUser.modifyProfile(userProfileDefault, jsonUpdate)
                console.log("AbcdEfgService::updateAbcdEfgProfile()/modifiedAbcdEfgProfile2:", modifiedAbcdEfgProfile)
                // strAbcdEfgData = JSON.stringify(modifiedAbcdEfgProfile)
                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strAbcdEfgData = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.acl)
            }



            console.log("AbcdEfgService::updateAbcdEfgProfile()/03")
            requestQuery.update = { abcdEfgProfile: strAcl }
            console.log("AbcdEfgService::updateAbcdEfgProfile()/requestQuery:", requestQuery)
            console.log("AbcdEfgService::updateAbcdEfgProfile()/strUserProfile1-0:", JSON.stringify(await modifiedAbcdEfgProfile))

            // update abcdEfgProfile
            let serviceInput: IServiceInput = {
                serviceInstance: this,
                serviceModel: AbcdEfgModel,
                docName: 'AbcdEfgService::updateAbcdEfgProfile',
                cmd: {
                    query: requestQuery
                }
            };
            console.log("AbcdEfgService::updateAbcdEfgProfile()/serviceInput:", serviceInput)
            const updateAbcdEfgRet = await this.updateI(req, res, serviceInput)
            const newAbcdEfgProfile = await this.existingAbcdEfgProfile(req, res, sessionDataExt.currentUser.userId)
            console.log("AbcdEfgService::updateAbcdEfgProfile()/newAbcdEfgProfile:", newAbcdEfgProfile)
            let retAbcdEfg = {
                updateRet: updateAbcdEfgRet,
                newProfile: newAbcdEfgProfile
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
                docName: 'AbcdEfgService::updateAbcdEfgProfile',
                cmd: {
                    query: userUpdateQuery
                }
            };
            console.log("AbcdEfgService::updateAbcdEfgProfile()/userServiceInput:", userServiceInput)
            const userUpdateRet = await svUser.updateI(req, res, userServiceInput)
            const fullProfile = await this.getI(req, res, { where: { userId: sessionDataExt.currentUser.userId } })
            console.log("AbcdEfgService::updateAbcdEfgProfile()/fullProfile:", JSON.stringify(await fullProfile))
            console.log("AbcdEfgService::updateAbcdEfgProfile()/strUserProfile1-1:", JSON.stringify(await modifiedAbcdEfgProfile))
            const finalRet = {
                updateRet: updateAbcdEfgRet,
                userUpdateRet: userUpdateRet,
                newProfile: await modifiedAbcdEfgProfile
            }

            // Respond with the retrieved profile data
            this.b.cdResp.data = finalRet;
            return await this.b.respond(req, res);
        } catch (e) {
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:updateCurrentUserProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }

    async resetAbcdEfgProfile(req, res): Promise<void> {
        try {

            const svSess = new SessionService()
            const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(req, res, true)
            console.log("AbcdEfgService::updateCurrentUserProfile()/sessionDataExt:", sessionDataExt)
            const svUser = new UserService()
            const requestQuery: IQuery = req.post.dat.f_vals[0].query;
            const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
            let modifiedAbcdEfgProfile: IAbcdEfgProfile;
            let strUserProfile;
            let strAbcdEfgData;
            let strAcl;

            /**
             * extract from db and merge with user profile to form abcdEfgProfile
             * 1. profile data from current user abcd_member entity. 
             * 2. membership data
             */
            await this.resetAbcdEfgProfileI(req, res)

            if (await this.validateProfileData(req, res, this.mergedProfile)) {
                /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
                console.log("AbcdEfgService::updateAbcdEfgProfile()/01")
                console.log("AbcdEfgService::updateAbcdEfgProfile()/jsonUpdate:", jsonUpdate)
                modifiedAbcdEfgProfile = await svUser.modifyProfile(this.mergedProfile, jsonUpdate)
                console.log("AbcdEfgService::updateAbcdEfgProfile()/strUserProfile3:", modifiedAbcdEfgProfile)


                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strAbcdEfgData = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.acl)

            } else {
                /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
                console.log("AbcdEfgService::updateAbcdEfgProfile()/021")
                const { password, userProfile, ...filteredUserData } = sessionDataExt.currentUser;
                userProfileDefault.userData = filteredUserData;
                console.log("AbcdEfgService::updateAbcdEfgProfile()/userProfileDefault:", userProfileDefault)
                modifiedAbcdEfgProfile = await svUser.modifyProfile(userProfileDefault, jsonUpdate)
                console.log("AbcdEfgService::updateAbcdEfgProfile()/modifiedAbcdEfgProfile4:", modifiedAbcdEfgProfile)
                // strAbcdEfgData = JSON.stringify(modifiedAbcdEfgProfile)
                // userProfile
                strUserProfile = JSON.stringify(await this.extractUserProfile())
                // acl
                strAbcdEfgData = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.memberData)
                // memberData
                strAcl = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.acl)
            }

            // // userProfile
            // strUserProfile = JSON.stringify(modifiedAbcdEfgProfile.userProfile)
            // // acl
            // strAbcdEfgData = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.memberData)
            // // memberData
            // strAcl = JSON.stringify(modifiedAbcdEfgProfile.abcdEfgship.acl)

            console.log("AbcdEfgService::updateAbcdEfgProfile()/modifiedAbcdEfgProfile3:", modifiedAbcdEfgProfile)

            console.log("AbcdEfgService::updateAbcdEfgProfile()/03")
            requestQuery.update = { abcdEfgProfile: strAcl }
            console.log("AbcdEfgService::updateAbcdEfgProfile()/requestQuery:", requestQuery)

            // update abcdEfgProfile
            let serviceInput: IServiceInput = {
                serviceInstance: this,
                serviceModel: AbcdEfgModel,
                docName: 'AbcdEfgService::updateAbcdEfgProfile',
                cmd: {
                    query: requestQuery
                }
            };
            console.log("AbcdEfgService::updateAbcdEfgProfile()/serviceInput:", serviceInput)
            const updateAbcdEfgRet = await this.updateI(req, res, serviceInput)
            const newAbcdEfgProfile = await this.existingAbcdEfgProfile(req, res, sessionDataExt.currentUser.userId)
            let retAbcdEfg = {
                updateRet: updateAbcdEfgRet,
                newProfile: newAbcdEfgProfile
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
                docName: 'AbcdEfgService::updateAbcdEfgProfile',
                cmd: {
                    query: userUpdateQuery
                }
            };
            console.log("AbcdEfgService::updateAbcdEfgProfile()/userServiceInput:", userServiceInput)
            const userUpdateRet = await svUser.updateI(req, res, userServiceInput)
            const fullProfile = await this.getI(req, res, { where: { userId: sessionDataExt.currentUser.userId } })
            const finalRet = {
                updateRet: updateAbcdEfgRet,
                userUpdateRet: userUpdateRet,
                newProfile: modifiedAbcdEfgProfile
            }

            // Respond with the retrieved profile data
            this.b.cdResp.data = finalRet;
            return await this.b.respond(req, res);
        } catch (e) {
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:updateCurrentUserProfile',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }

    async extractUserProfile() {
        // Create a new object without 'abcdEfgship'
        const userProfileOnly: IUserProfileOnly = { ...this.mergedProfile };

        // Remove 'abcdEfgship' property
        delete (userProfileOnly as any).abcdEfgship; // Temporarily type-cast to allow deletion

        // Now `userProfileOnly` is of type `IUserProfileOnly`, with `abcdEfgship` removed.
        return userProfileOnly
    }

    /////////////////////////////////////////////
    // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
    //

    async existingAbcdEfgProfile(req, res, cuid) {
        const si: IServiceInput = {
            serviceInstance: this,
            serviceModel: AbcdEfgModel,
            docName: 'AbcdEfgService::existingUserProfile',
            cmd: {
                query: { where: { userId: cuid } }
            },
            mapping: { profileField: "abcdEfgProfile" }
        };
        return ProfileServiceHelper.fetchProfile(req, res, si);
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
        console.log("AbcdEfgService::validateProfileData()/profileData:", profileData)
        // const profileData: IUserProfile = updateData.update.userProfile
        // console.log("AbcdEfgService::validateProfileData()/profileData:", profileData)
        // Check if profileData is null or undefined
        if (!profileData) {
            console.log("AbcdEfgService::validateProfileData()/01")
            return false;
        }

        // Validate that the required fields of IUserProfile exist
        if (!profileData.fieldPermissions || !profileData.userData) {
            console.log("AbcdEfgService::validateProfileData()/02")
            console.log("AbcdEfgService::validateProfileData()/profileData.userData:", profileData.userData)
            console.log("AbcdEfgService::validateProfileData()/profileData.fieldPermissions:", profileData.fieldPermissions)
            return false;
        }

        // Example validation for bio length
        if (profileData.bio && profileData.bio.length > 500) {
            console.log("AbcdEfgService::validateProfileData()/03")
            const e = "Bio data is too long";
            this.b.err.push(e);
            const i = {
                messages: this.b.err,
                code: 'AbcdEfgService:validateProfileData',
                app_msg: ''
            };
            await this.b.serviceErr(req, res, e, i.code);
            return false;  // Bio is too long
        }
        return true;
    }

    // CRUD Methods for abcdRole within abcdEfgship
    // // Usage examples
    // const memberProfile = abcdEfgProfileDefault;

    // // Add a new role
    // addAbcdRole(memberProfile, -1, { scope: AbcdsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 101 });

    // // Get all roles for a specific abcdEfgship by abcdId
    // console.log(getAbcdRoles(memberProfile, -1));

    // // Update an existing role
    // const updated = updateAbcdRole(memberProfile, -1, AbcdsAclScope.COOPS_SACCO_ADMIN, { scope: AbcdsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 202 });
    // console.log('Update successful:', updated);

    // // Delete a role
    // const deleted = deleteAbcdRole(memberProfile, -1, AbcdsAclScope.COOPS_GUEST);
    // console.log('Delete successful:', deleted);

    /**
     * Add a new role to abcdRole within a specific abcdEfgship identified by abcdId
     * @param profile The member profile to modify
     * @param abcdId The ID of the specific abcdEfgship
     * @param newRole The new role to add to abcdRole
     */
    addAbcdRole(profile: IAbcdEfgProfile, abcdId: number, newRole: IAbcdAcl): boolean {
        const memberMeta = profile.abcdEfgship.acl?.find(m => m.abcdId === abcdId);
        if (memberMeta) {
            memberMeta.abcdRole.push(newRole);
            return true;
        }
        return false; // Return false if abcdEfgship with the given abcdId was not found
    }

    /**
     * Get all abcd roles from a specific abcdEfgship identified by abcdId
     * @param profile The member profile to retrieve roles from
     * @param abcdId The ID of the specific abcdEfgship
     * @returns An array of IAbcdAcl representing all abcd roles, or null if not found
     */
    getAbcdRoles(profile: IAbcdEfgProfile, abcdId: number): IAbcdRole | null {
        const memberMeta = profile.abcdEfgship.acl?.find(m => m.abcdId === abcdId);
        return memberMeta ? memberMeta.abcdRole : null;
    }

    /**
     * Update an existing role in abcdRole within a specific abcdEfgship identified by abcdId
     * @param profile The member profile to modify
     * @param abcdId The ID of the specific abcdEfgship
     * @param scope The scope of the role to update
     * @param updatedRole The updated role data
     * @returns boolean indicating success or failure
     */
    updateAbcdRole(profile: IAbcdEfgProfile, abcdId: number, scope: AbcdsAclScope, updatedRole: IAbcdAcl): boolean {
        const memberMeta = profile.abcdEfgship.acl?.find(m => m.abcdId === abcdId);
        if (memberMeta) {
            const roleIndex = memberMeta.abcdRole.findIndex(role => role.scope === scope);
            if (roleIndex !== -1) {
                memberMeta.abcdRole[roleIndex] = updatedRole;
                return true;
            }
        }
        return false; // Return false if role with the given scope was not found in abcdRole
    }

    /**
     * Remove a role from abcdRole within a specific abcdEfgship identified by abcdId
     * @param profile The member profile to modify
     * @param abcdId The ID of the specific abcdEfgship
     * @param scope The scope of the role to remove
     * @returns boolean indicating success or failure
     */
    deleteAbcdRole(profile: IAbcdEfgProfile, abcdId: number, scope: AbcdsAclScope): boolean {
        const memberMeta = profile.abcdEfgship.acl?.find(m => m.abcdId === abcdId);
        if (memberMeta) {
            const roleIndex = memberMeta.abcdRole.findIndex(role => role.scope === scope);
            if (roleIndex !== -1) {
                memberMeta.abcdRole.splice(roleIndex, 1);
                return true;
            }
        }
        return false; // Return false if role with the given scope was not found in abcdRole
    }

}