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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
var USER_ANON = 1000;
var BaseController = /** @class */ (function () {
    function BaseController() {
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
        ///////////////////////
    }
    // private create_i = false;
    // private update_i = false;
    // private delete_i = false;
    // private module_arr;
    BaseController.prototype.getEClass = function (ePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require(ePath)); })];
                    case 1: 
                    // return await import(ePath).then(async (cls: any) => {
                    //     console.log('getEClass/cls:', cls);
                    //     return await cls;
                    // });
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BaseController.prototype.setContentType = function (req) {
        // let header = req.header;
        // let contentTypeStr = header['content-type'][0];
        // let contentTypeArray = explode(';', contentTypeStr);
        // this.contentTypeName = contentTypeArray[0];
    };
    BaseController.prototype.valid = function (req, res) {
        return true;
    };
    BaseController.prototype.controllerCreate = function (req, res) {
        return 1;
    };
    BaseController.prototype.controllerUpdate = function (req, res) {
        return 1;
    };
    BaseController.prototype.controllerDelete = function (req, res) {
        return 1;
    };
    /**
     *
     * The type K is constrained to be a value computed from the keyof operator on
     * type T. Remember that the keyof operator will return a string literal type that is made
     * up of the properties of an object, so K will be constrained to the property names of
     * the type T.
     *
     * @param object
     * @param key
     */
    BaseController.prototype.getProperty = function (object, key) {
        var propertyValue = object[key];
        console.log("object[" + key + "] = " + propertyValue);
    };
    BaseController.prototype.testGetProperty = function () {
        var obj1 = {
            id: 1,
            name: 'myName',
            print: function () { console.log("" + this.id); }
        };
        this.getProperty(obj1, 'id');
        this.getProperty(obj1, 'name');
        // this.getProperty(obj1, 'surname'); // fails
    };
    ///////////////////////
    BaseController.prototype.createClassInstance = function (arg1) {
        return new arg1();
    };
    ///////////////////////
    // Promise
    BaseController.prototype.cdPromise = function () {
        // return new Promise object
        return new Promise(// start constructor
        function (resolve, // resolve function
        reject // reject function
        ) {
            // start of function definition
            function afterTimeout() {
                resolve();
            }
            setTimeout(afterTimeout, 1000);
            // end of function definition
        }); // end constructor
    };
    BaseController.prototype.testDelayedPromise = function () {
        this.cdPromise().then(function () {
            console.log("delayed promise returned");
        });
    };
    BaseController.prototype.respond = function (req, res, data) {
        console.log("starting BaseController::respond()");
        res.status(200).json({ data: data });
    };
    return BaseController;
}());
exports.BaseController = BaseController;
//# sourceMappingURL=base.controller.js.map