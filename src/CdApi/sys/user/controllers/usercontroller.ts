
import { createConnection, getConnection,  } from 'typeorm';
import 'reflect-metadata';
import { BaseController } from '../../base/base.controller';
import { User } from '../models/User';

export class UserController {
    b: BaseController;
    constructor() {
        console.log('starting UserController::constructor()');
        this.b = new BaseController();
    }

    async Register(req, res) {
        createConnection().then(async connection => {

            console.log('Inserting a new user into the database...');
            const user = new User();
            user.fname = 'Timber';
            user.lname = 'Saw';
            user.password = 'secret';
            user.email = 'iii';
            user.username = 'tisaw';
            const ret = await connection.manager.save(user);
            console.log('Saved a new user with id: ' + user.user_id);

            /////////////////////////////////////

            // console.log('Loading users from the database...');
            // const users = await connection.manager.find(User);
            // console.log('Loaded users: ', users);

            // console.log('Here you can setup and run express/koa/any other framework.');


            // const ret = await getConnection()
            //     .createQueryBuilder()
            //     .insert()
            //     .into(User)
            //     .values([
            //         { fname: 'Timber', lname: 'Saw', password: 'secret', email: 'eee', username: 'tisaw' },
            //         { fname: 'Phantom', lname: 'Lancer', password: 'admin', email: 'fff', username: 'phalance' }
            //     ])
            //     .execute();
            getConnection().close();
            console.log('ret', ret);
            const r = await this.b.respond(req, res, ret);
            // return ret;
        }).catch(async (error) => {
            getConnection().close();
            console.log(`Error: ${error}`);
            // return error;
            await this.b.respond(req, res, error);
        });
    }
}