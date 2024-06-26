import qs from 'qs';
import { DEFAULT_CD_REQUEST, DEFAULT_CD_RESPONSE } from '../base/IBase';
import { Logging } from '../base/winston.log';

export class CdRequest {
    logger: Logging;
    constructor() {
        this.logger = new Logging()
    }

    async processPost(req, resp, callback) {
        this.logger.logInfo('CdRequest::processPost()/01')
        let queryData = '';
        let contentType;
        let jQueryData;
        if (req.method === 'POST') {
            this.logger.logInfo('CdRequest::processPost()/02')
            contentType = req.headers['content-type'];
            // this.logger.logInfo('CdRequest::processPost():', {request:req})
            // console.dir("CdRequest::processPost():/req:", JSON.stringify(req))
            // const jsonString = JSON.stringify(req, getCircularReplacer());
            // console.log('CdRequest::processPost():/req:',jsonString);
            this.logger.logInfo('CdRequest::processPost():', { pl: req.body })
            this.logger.logInfo('CdRequest::processPost():', { contentType: contentType })
            req.post = req.body

            // req.on('data', (data) => {
            //     this.logger.logInfo('CdRequest::processPost()/data:', data)
            //     queryData += data;
            //     if (queryData.length > 1e6) {
            //         queryData = '';
            //         resp.writeHead(413, { 'Content-Type': 'text/plain' }).end();
            //         req.connection.destroy();
            //     }
            // });
            // req.on('end', async () => {
            //     this.logger.logInfo('CdRequest::processPost()/03')
            //     this.logger.logInfo('CdRequest::processPost():', { queryData: queryData })
            //     const dType = typeof (queryData);
            //     if (dType === 'string' && req.headers['content-type'] === 'application/json') { // esp when testing with curl to post in json
            //         try {
            //             jQueryData = JSON.parse(queryData);
            //             req.post = jQueryData;
            //         } catch (e) {
            //             console.log('request validation error:', e.toString());
            //             req.post = DEFAULT_CD_REQUEST;
            //         }
            //     }
            //     else {
            //         // handle
            //     }
                const inp = await req.post;
                callback();
            // });

        } else {
            this.logger.logInfo('CdRequest::processPost()/04')
            return {};
        }
    }


}

function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
}
// export async function processPost(req, resp, callback) {
//     console.log('processPost/01');
//     let queryData = '';
//     let contentType;
//     let jQueryData;
//     if (req.method === 'POST') {
//         console.log('processPost/02');
//         contentType = req.headers['content-type'];
//         req.on('data', (data) => {
//             console.log('processPost/data:', data);
//             queryData += data;
//             if (queryData.length > 1e6) {
//                 queryData = '';
//                 resp.writeHead(413, { 'Content-Type': 'text/plain' }).end();
//                 req.connection.destroy();
//             }
//         });
//         req.on('end', async () => {
//             const dType = typeof (queryData);
//             if (dType === 'string' && req.headers['content-type'] === 'application/json') { // esp when testing with curl to post in json
//                 try {
//                     jQueryData = JSON.parse(queryData);
//                     req.post = jQueryData;
//                 } catch (e) {
//                     console.log('request validation error:', e.toString());
//                     req.post = DEFAULT_CD_REQUEST;
//                 }
//             }
//             else {
//                 // handle
//             }
//             const inp = await req.post;
//             callback();
//         });

//     } else {
//         return {};
//     }
// }


