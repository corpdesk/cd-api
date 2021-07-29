import qs from 'qs';
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
                jQueryData = JSON.parse(queryData);
                req.post = jQueryData;
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


