"use strict";
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
exports.CdInit = void 0;
const request_1 = require("../utils/request");
const CdExec_1 = require("./CdExec");
function CdInit(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('starting CdInit (req, res)');
        const r = yield request_1.processPost(req, res, () => __awaiter(this, void 0, void 0, function* () {
            // console.log('req.post3:', req.post);
            const cb = new CdExec_1.CdExec();
            cb.exec(req, res);
            res.status(200).json({ module: req.post.m });
        }));
    });
}
exports.CdInit = CdInit;
;
//# sourceMappingURL=init.js.map