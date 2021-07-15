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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const express_1 = __importDefault(require("express"));
// import cors from 'cors';
const cors_1 = __importDefault(require("cors"));
const init_1 = require("./CdApi/init");
const app = express_1.default();
const router = express_1.default.Router();
const port = config_1.default.port;
const API_URL = 'http://localhost:' + port;
const options = config_1.default.cors.options;
app.use(cors_1.default(options));
// enable pre-flight
app.options('*', cors_1.default(options));
app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader('Content-Type', 'application/json');
    init_1.CdInit(req, res);
}));
app.listen(port, () => {
    console.log(`server is listening on ${port}`);
})
    .on('error', () => {
    console.log(`Error!`);
});
//# sourceMappingURL=app.js.map