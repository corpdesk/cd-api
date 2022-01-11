import qs from 'qs';
import { DEFAULT_CD_REQUEST, DEFAULT_CD_RESPONSE } from '../base/IBase';
export async function processPost(req, resp, callback) {
    let queryData = '';
    let contentType;
    let jQueryData;
    if (req.method === 'POST') {
        contentType = req.headers['content-type'];
        req.on('data', (data) => {
            queryData += data;
            if (queryData.length > 1e6) {
                queryData = '';
                resp.writeHead(413, { 'Content-Type': 'text/plain' }).end();
                req.connection.destroy();
            }
        });
        req.on('end', async () => {
            const dType = typeof (queryData);
            if (dType === 'string' && req.headers['content-type'] === 'application/json') { // esp when testing with curl to post in json
                try {
                    jQueryData = JSON.parse(queryData);
                    req.post = jQueryData;
                } catch (e) {
                    console.log('request validation error:', e.toString());
                    req.post = DEFAULT_CD_REQUEST;
                }
            }
            else {
                // handle
            }
            const inp = await req.post;
            callback();
        });

    } else {
        return {};
    }
}


