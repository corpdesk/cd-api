#!/bin/bash

# issur curl request
curl -k -X POST -H 'Content-Type: application/json' -H 'anon:0' -H 'p_sid:goqes5rof9i8tcvrv341krjld8' -H 'sess_ttl:10' -H 'token:2DC1B60A-4361-A274-ACB5-622C842B545C' -d '{"m":"moduleman","c":"cd_cache","a":"read","dat":{"fields":["content_id","user_id","content"],"filter":{"content_id":"moduleman_ModulesController_GetModuleUserData_156_1010","user_id":"1010"},"token":"CADFE0DB-342F-C8DB-6EAA-7CDDE9621C52","p_sid":"s3n39am5n3l18lskvast7v5t99","sess_ttl":"10","init_ctx":"login"},"args":{"doc_from":"","doc_to":"","subject":"read cd_accts_bank","doctyp_id":""}}' http://localhost:3001 -v

#exprected response should be of the format:
# {"app_state":{"success":false,"info":{"messages":["invalid request"],"code":"BaseService:noTocken:01","app_msg":""},"sess":null,"cache":{},"sConfig":{"usePush":true,"usePolling":true,"useCacheStore":true}},"data":[]}


