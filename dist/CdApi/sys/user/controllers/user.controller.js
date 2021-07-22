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
exports.UserController = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const base_controller_1 = require("../../../sys/base/base.controller");
const User_1 = require("../models/User");
class UserController {
    constructor() {
        console.log('starting UserController::constructor()');
        this.b = new base_controller_1.BaseController();
    }
    Register(req, res) {
        typeorm_1.createConnection().then((connection) => __awaiter(this, void 0, void 0, function* () {
            // console.log('Inserting a new user into the database...');
            // let user = new User();
            // user.fname = 'Timber';
            // user.lname = 'Saw';
            // user.password = 'secret';
            // user.email = 'iii';
            // user.username = 'tisaw';
            // await connection.manager.save(user);
            // console.log('Saved a new user with id: ' + user.user_id);
            /////////////////////////////////////
            // console.log('Loading users from the database...');
            // const users = await connection.manager.find(User);
            // console.log('Loaded users: ', users);
            // console.log('Here you can setup and run express/koa/any other framework.');
            const ret = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .insert()
                .into(User_1.User)
                .values([
                { fname: 'Timber', lname: 'Saw', password: 'secret', email: 'eee', username: 'tisaw' },
                { fname: 'Phantom', lname: 'Lancer', password: 'admin', email: 'fff', username: 'phalance' }
            ])
                .execute();
            console.log('ret', ret);
            this.b.respond(req, res, ret);
            // return ret;
        })).catch((error) => {
            console.log(`Error: ${error}`);
            return error;
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map