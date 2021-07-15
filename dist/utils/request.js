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
exports.processPost = void 0;
function processPost(req, resp, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('starting processPost(req, resp)');
        let queryData = '';
        let contentType;
        let jQueryData;
        if (req.method === 'POST') {
            // console.log('processPost/req>>');
            // console.dir(req);
            console.log('processPost/req.headers[content-type]>>');
            console.dir(req.headers['content-type']);
            contentType = req.headers['content-type'];
            req.on('data', (data) => {
                queryData += data;
                if (queryData.length > 1e6) {
                    queryData = '';
                    resp.writeHead(413, { 'Content-Type': 'text/plain' }).end();
                    req.connection.destroy();
                }
            });
            req.on('end', () => __awaiter(this, void 0, void 0, function* () {
                console.log('processPost/queryData2>>');
                // console.log('queryData1:', queryData);
                const dType = typeof (queryData);
                // console.log('dType=' + dType);
                if (dType === 'string' && req.headers['content-type'] === 'application/json') { // esp when testing with curl to post in json
                    console.log('processPost/queryData1>>');
                    console.log(queryData);
                    jQueryData = JSON.parse(queryData);
                    req.post = jQueryData;
                }
                else {
                    // req.post = qs.parse(queryData);
                    console.log('req.post1:', req.post);
                }
                // console.log('req.post2:', req.post);
                const inp = yield req.post;
                callback();
                // resp.status(200).json({ module: inp.m });
            }));
        }
        else {
            return {};
        }
    });
}
exports.processPost = processPost;
//# sourceMappingURL=request.js.map