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
exports.CdExec = void 0;
const base_controller_1 = require("./sys/base/base.controller");
class CdExec {
    constructor() {
        this.b = new base_controller_1.BaseController();
    }
    exec(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.b.valid(req, res)) {
                try {
                    const pl = req.post; // payload;
                    const ePath = './' + pl.ctx.toLowerCase() + '/' + pl.m.toLowerCase() + '/controllers/' + pl.c.toLowerCase();
                    console.log('init()/ePath:', ePath);
                    const eImport = yield Promise.resolve().then(() => __importStar(require(ePath)));
                    const eCls = eImport[pl.c];
                    const cls = new eCls();
                    const ret = cls[pl.a]();
                    console.log('init()/ret:', ret);
                }
                catch (e) {
                    console.log('e:', e);
                    return e;
                }
            }
            else {
                const err = 'invalid session';
                return this.b.returnErr(err);
            }
        });
    }
}
exports.CdExec = CdExec;
//# sourceMappingURL=CdExec.js.map