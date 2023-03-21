#!/bin/bash

# issur curl request
curl -k -X POST -H 'Content-Type: application/json' -d '{ "ctx": "Sys", "m": "User", "c": "User", "a": "Login", "dat": { "f_vals": [ { "data": { "userName": "karl", "password": "secret", "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD" } } ], "token": null }, "args": null }' http://localhost:3001 -v
#exprected response should be of the format:


