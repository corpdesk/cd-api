/*
// cd-lib/projects/core/src/lib/user/user.service.ts
setEnvelopeAuth(authData: IAuthData) {
  this.postData = {
    ctx: 'Sys',
    m: 'User',
    c: 'User',
    a: 'Login',
    dat: {
      f_vals: [
        {
          data: authData
        }
      ],
      token: null
    },
    args: null
  };
}
// cd-lib/projects/core/src/lib/user/user-model.ts
export interface IAuthData {
  userName: string;
  password: string;
  rememberMe?: boolean,
  consumerGuid: string;
}
*/

loginRequest = {
  "ctx": "Sys",
  "m": "User",
  "c": "User",
  "a": "Login",
  "dat": {
    "f_vals": [
      {
        "data": {
          "userName": "karl",
          "password": "secret",
          "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
        }
      }
    ],
    "token": null
  },
  "args": null
}