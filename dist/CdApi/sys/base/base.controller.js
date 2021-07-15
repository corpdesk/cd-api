"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const USER_ANON = 1000;
class BaseController {
    constructor() {
        this.appState = {
            success: 1,
            info: { messages: '', code: 0, app_msg: '' },
            sess: [],
            cache: { 'dat_scope': 0 },
        };
        this.rules = {};
        this.cuid = USER_ANON; // current user id...id of the current user. Default is 1000
        this.appMsgs = []; // to hold list of messages
        this.affectedRows = [];
    }
    // private create_i = false;
    // private update_i = false;
    // private delete_i = false;
    // private module_arr;
    getEClass(ePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // return await import(ePath).then(async (cls: any) => {
            //     console.log('getEClass/cls:', cls);
            //     return await cls;
            // });
            return yield Promise.resolve().then(() => __importStar(require(ePath)));
        });
    }
    setContentType(req) {
        // let header = req.header;
        // let contentTypeStr = header['content-type'][0];
        // let contentTypeArray = explode(';', contentTypeStr);
        // this.contentTypeName = contentTypeArray[0];
    }
    valid(req, res) {
        return true;
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=base.controller.js.map