

import * as dotenv from 'dotenv'; import { Server } from 'socket.io';
// import { color, log, red, green, cyan, cyanBright, blue, yellow } from 'console-log-colors';
// import { bold, white, gray } from 'console-log-colors';
import { createClient, RedisClientOptions } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { createServer } from 'http';
import Redis from "ioredis";
import { ICdPushEnvelop, ICommConversationSub, ISocketItem, PushEvent } from '../../base/IBase';
import config from '../../../../config';
import { BaseService } from '../../base/base.service';
dotenv.config();

//////////
/**
 * overload the default console.log function
 * for debugging
 */
// const fs = require('fs');
// const util = require('util');
// const log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
// const log_stdout = process.stdout;

// console.log = function (d) { //
//     log_file.write(util.format(d) + '\n');
//     log_stdout.write(util.format(d) + '\n');
// };
////////////////////////////////////

// const io = new Server();
// const pubClient = createClient({ host: 'cd-sio-23', port: 6379 } as RedisClientOptions);
// const subClient = pubClient.duplicate();

export class SioService {
    b = new BaseService();

    constructor(){
    }

    run(io, pubClient, subClient) {
        // console.log("SioService::run()/io:", io)
        // console.log("SioService::run()/pubClient:", pubClient)
        // console.log("SioService::run()/subClient:", subClient)
        const port = config.push.serverPort;
        pubClient.on("error", (err) => {
            console.log(`pubClient error: ${JSON.stringify(err)}`);
        });
        io.adapter(createAdapter(pubClient, subClient));
        io.on('connection', (socket) => {
            console.log('a user connected');
            this.runRegisteredEvents(socket, io, pubClient)
            socket.on('disconnect', () => {
                console.log('a user disconnected!');
            });
        });
    }

    /**
     * This array can be a configuration available in the database.
     * There would then be different sets depending on the calling application.
     * This would then mean one server can handle several applications..eg:
     * - memo
     * - tracking financial transaction
     * - authentication process
     * - system transaction tracking
     * triggerEvent: the listening event at the server to handle a given message
     *              or event emitted by the client
     * emittEvent: the listening event at the client to handles a given message
     *              or event emitted by the server
     * sFx: server function that handles a given message
     * 
     * cFx: client function that handles a given message
     */
    getRegisteredEvents(): PushEvent[] {
        console.log('starting getRegisteredEvents()');
        this.testColouredLogs();
        return [
            {
                triggerEvent: 'register-client',
                emittEvent: 'push-registered-client',
                sFx: 'push'
            },
            {
                triggerEvent: 'srv-received',
                emittEvent: 'push-srv-received',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-relayed',
                emittEvent: 'push-msg-relayed',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-pushed',
                emittEvent: 'push-msg-pushed',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-received',
                emittEvent: 'push-delivered',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-completed',
                emittEvent: 'push-msg-completed',
                sFx: 'push'
            },
            {
                triggerEvent: 'register',
                emittEvent: 'registered',
                sFx: 'push'
            },
            {
                triggerEvent: 'login',
                emittEvent: 'push-menu',
                sFx: 'pushEnvelop'
            },
            {
                triggerEvent: 'send-memo',
                emittEvent: 'push-memo',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-pub',
                emittEvent: 'push-pub',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-react',
                emittEvent: 'push-react',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-menu',
                emittEvent: 'push-menu',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-notif',
                emittEvent: 'push-notif',
                sFx: 'push'
            }
        ]
    }

    runRegisteredEvents(socket, io, pubClient) {
        console.log('SioService::runRegisteredEvents(socket)/01');
        // console.log('SioService::runRegisteredEvents(socket)/socket:', socket);
        // listen to registered events
        this.getRegisteredEvents().forEach((e) => {

            console.log(`SioService::runRegisteredEvents(socket)/e:${JSON.stringify(e)}`);
            socket.on(e.triggerEvent, async (payLoad: string) => {
                console.log('---------------------------------------')
                console.log(`socket.on${e.triggerEvent}`)
                console.log('---------------------------------------')
                console.log(`SioService::runRegisteredEvents()/e.triggerEvent:${e.triggerEvent}`);
                console.log(`SioService::runRegisteredEvents()/payLoad:${JSON.stringify(payLoad)}`);
                const pushEnvelop: ICdPushEnvelop = JSON.parse(payLoad)
                const sender = this.getSender(pushEnvelop.pushData.pushRecepients);
                console.log(`SioService::runRegisteredEvents()/sender:${JSON.stringify(sender)}`);
                await this.persistSenderData(sender, socket, pubClient)
                if (pushEnvelop.pushData.commTrack.completed) {
                    /**
                     * process message completion
                     */
                    console.log('SioService::getRegisteredEvents()/message processing completed')
                    console.log(`SioService::getRegisteredEvents()/pushEnvelop:${pushEnvelop}`);
                    console.log('--------------------------------------------------------------------------')
                    console.log('PROCESS COMPLETED')
                    console.log('--------------------------------------------------------------------------')
                } else {
                    this.relayMessages(pushEnvelop, io, pubClient)
                }

            });
        })
    }

    getSender(pushRecepients: ICommConversationSub[]): ICommConversationSub {
        return pushRecepients.filter((r) => r.subTypeId === 1)[0]
    }

    resourceHasSocket() {
        // confirm if resource has socket already
    }

    async persistSenderData(sender: ICommConversationSub, socket, pubClient) {
        console.log(`SioService::persistSenderData/01/socket.id: ${socket.id}`);
        sender.cdObjId.socketId = socket.id;
        const k = sender.cdObjId.resourceGuid;
        const v = JSON.stringify(sender);
        console.log(`SioService::persistSenderData()/k:${k}`);
        console.log(`SioService::persistSenderData()/v:${v}`);
        return await this.b.wsRedisCreate(k, v);
    }

    relayMessages(pushEnvelop: ICdPushEnvelop, io, pubClient) {
        if (pushEnvelop.pushData.commTrack.completed === true) {
            console.log(`SioService::relayMessages()/pushEnvelop:${pushEnvelop}`);
            console.log('--------------------------------------------------------------------------')
            console.log('PROCESS COMPLETED')
            console.log('--------------------------------------------------------------------------')

        } else {
            pushEnvelop.pushData.pushRecepients.forEach(async (recepient: ICommConversationSub) => {
                let payLoad = '';
                console.log(`SioService::relayMessages()/recepient:${JSON.stringify(recepient)}`);
                console.log("SioService::relayMessages()/pushEnvelop.pushData.pushRecepients:",pushEnvelop.pushData.pushRecepients);
                // const recepientSocket = this.recepientSocket(recepient, pubClient);
                const recepientDataStr = await this.destinationSocket(recepient);
                console.log("SioService::relayMessages()/pushEnvelop.pushData.recepientDataStr:",recepientDataStr);
                const recepientData = JSON.parse(recepientDataStr.r);
                console.log(`SioService::relayMessages()/recepientData:${JSON.stringify(recepientData)}`);
                
                if(recepientDataStr.r){
                    const recepientSocketId = recepientData.cdObjId.socketId;
                    // const msg = JSON.stringify(pushEnvelop);
                    switch (recepient.subTypeId) {
                        case 1:
                            console.log('--------------------------------------------------------------------------')
                            console.log('STARTING MESSAGE TO SENDER')
                            console.log('--------------------------------------------------------------------------')
                            // handle message to sender:
                            // mark message as relayed plus relayedTime
                            // const pushEnvelop1 = this.shallow(pushEnvelop)
                            const pushEnvelop1: ICdPushEnvelop = JSON.parse(JSON.stringify(pushEnvelop));
                            pushEnvelop1.pushData.commTrack.relayTime = Number(new Date());
    
                            // pushEnvelop1.pushData.emittEvent = 'push-msg-relayed';
                            if (pushEnvelop1.pushData.commTrack.relayed !== true) {
                                pushEnvelop1.pushData.isNotification = true;
                            }
    
                            console.log(`SioService::relayMessages()/[switch 1] pushEnvelop:${JSON.stringify(pushEnvelop1)}`);
                            console.log('SioService::relayMessages()/[switch 1] sending confirmation message to sender');
                            console.log(`SioService::relayMessages()/[switch 1] pushEnvelop.pushData.triggerEvent:${pushEnvelop1.pushData.triggerEvent}`);
                            console.log('case-1: 01')
                            if (pushEnvelop1.pushData.isAppInit) {
                                /**
                                 * if the incoming message is for applitialization:
                                 * - nb: the resourceGuid is already saved in redis for reference
                                 * - save socket in envelop
                                 * - push message back to sender with socketid info
                                 * - the client app will rely on these data for subsequest communication by federated components of the app
                                 */
                                console.log('--------------------------------------------------------------------------')
                                console.log('SENDING APP-INIT-DATA')
                                console.log(`case-1: 011...isAppInit->triggerEvent === push-registered-client`)
                                console.log('--------------------------------------------------------------------------')
                                const socketStore: ISocketItem = {
                                    socketId:recepientSocketId,
                                    name:'appInit',
                                    socketGuid: this.b.getGuid()
                                }
                                // save socket
                                pushEnvelop1.pushData.appSockets.push(socketStore)
                                // send back to sender
                                io.to(recepientSocketId).emit('push-registered-client', pushEnvelop1);
                            }
                            if (pushEnvelop1.pushData.isNotification) {
                                console.log('case-1: 02...isNotification')
                                if (pushEnvelop1.pushData.commTrack.relayed !== true && pushEnvelop1.pushData.commTrack.pushed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING NOTIFICATION')
                                    console.log(`case-1: 04...isNotification->triggerEvent === msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')
                                    pushEnvelop1.pushData.triggerEvent = 'msg-relayed';
                                    pushEnvelop1.pushData.commTrack.relayed = true;
                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-msg-relayed', pushEnvelop1);
                                }
    
                                if (pushEnvelop1.pushData.commTrack.delivered === true && pushEnvelop1.pushData.commTrack.completed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING NOTIFICATION')
                                    console.log(`case-1: 03...isNotification->event to emit === push-delivered`)
                                    console.log('--------------------------------------------------------------------------')
    
                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-delivered', pushEnvelop1);
                                }
    
                                // if (pushEnvelop1.pushData.triggerEvent === 'msg-received' && pushEnvelop1.pushData.commTrack.completed !== true) {
                                //     console.log('--------------------------------------------------------------------------')
                                //     console.log('SENDING NOTIFICATION')
                                //     console.log(`case-1: 041...isNotification->triggerEvent === msg-relayed`)
                                //     console.log('--------------------------------------------------------------------------')
    
                                //     /**
                                //      * this is notification from recepient to sender
                                //      * to confirm message has been delivered
                                //      */
                                //     io.to(recepientSocketId).emit('push-delivered', pushEnvelop1);
                                // }
                                // if (pushEnvelop1.pushData.triggerEvent === 'msg-completed' && pushEnvelop1.pushData.commTrack.completed !== true) {
                                //     console.log('--------------------------------------------------------------------------')
                                //     console.log('SENDING NOTIFICATION')
                                //     console.log(`case-1: 042...isNotification->triggerEvent === msg-completed`)
                                //     console.log('--------------------------------------------------------------------------')
    
                                //     /**
                                //      * record completion of messaging
                                //      */
                                //     console.log('message completed')
    
                                // }
                            } else {
                                console.log('case-1: 05')
                                // send notification to client for relay
                                if (pushEnvelop1.pushData.triggerEvent === 'msg-received') {
                                    console.log('case-1: 06')
                                    // console.log(`SioService::relayMessages()/[switch 1/[msg-received]] sending 'msg-received' message to sender`);
                                    // payLoad = JSON.stringify(pushEnvelop);
                                    // io.to(recepientSocketId).emit('push-delivered', payLoad);
                                } else {
                                    console.log('case-1: 07')
                                    console.log(`SioService::relayMessages()/[switch 1[push-msg-relayed]] sending 'push-msg-relayed' message to sender`);
                                    console.log(`SioService::relayMessages()/[switch 1[push-msg-relayed]]/recepientSocketId:${JSON.stringify(recepientSocketId)}`)
    
                                    payLoad = JSON.stringify(pushEnvelop1);
                                    console.log(`SioService::relayMessages()/[switch 1[push-msg-relayed]]/pushEnvelop1:${pushEnvelop1}`)
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING PAYLOAD')
                                    console.log(`case-1: 08...seding payload ->emit event === 'push-msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')
                                    io.to(recepientSocketId).emit('push-msg-relayed', pushEnvelop1);
                                    // io.to(recepientSocketId).emit('push-msg-relayed', '{"msg": "testing messege"}');
                                    // io.emit('push-msg-relayed', `{"msg": "testing messege"}`);
                                }
                            }
    
                            break;
                        case 7:
    
                            console.log('--------------------------------------------------------------------------')
                            console.log('STARTING MESSAGE TO RECEPIENTS')
                            console.log('--------------------------------------------------------------------------')
                            // const pushEnvelop7 = this.shallow(pushEnvelop)
                            const pushEnvelop7 = JSON.parse(JSON.stringify(pushEnvelop));
                            console.log(`SioService::relayMessages()/[switch 7] pushEnvelop copy:${JSON.stringify(pushEnvelop7)}`);
                            // handle message to destined recepient
                            // if(pushEnvelop.pushData.emittEvent === 'msg-received'){
                            //     // if it is message confirmation to sender
                            //     pushEnvelop.pushData.commTrack.deliveryTime = Number(new Date());
                            //     pushEnvelop.pushData.commTrack.deliverd = true;
                            // }
                            console.log('case-7: 01')
                            if (pushEnvelop7.pushData.isNotification) {
                                console.log('case-7: 02')
                            } else {
                                console.log('case-7: 03')
                                if (pushEnvelop7.pushData.commTrack.pushed) {
                                    console.log('case-7: 04')
                                } else {
                                    console.log('case-7: 05')
                                    pushEnvelop7.pushData.commTrack.relayTime = Number(new Date());
                                    pushEnvelop7.pushData.commTrack.relayed = true;
                                    pushEnvelop7.pushData.commTrack.pushTime = Number(new Date());
                                    pushEnvelop7.pushData.commTrack.pushed = true;
                                    pushEnvelop7.pushData.triggerEvent = 'msg-pushed';
                                    pushEnvelop7.pushData.emittEvent = 'push-msg-pushed';
                                    console.log(`SioService::relayMessages()/[switch 7] pushEnvelop7:${JSON.stringify(pushEnvelop7)}`);
                                    if (pushEnvelop7.pushData.triggerEvent === 'msg-received') {
                                        console.log('case-7: 06')
                                        // while relaying 'msg-received', do not send to group 7 (recepients)
                                        console.log('SioService::relayMessages()/[switch 7] not sending message to recepient, this is just confirmation');
                                    } else {
                                        console.log('case-7: 07')
                                        console.log(`SioService::relayMessages()/[switch 7] sending to recepient:${JSON.stringify(pushEnvelop7)}`);
                                        console.log('--------------------------------------------------------------------------')
                                        console.log('SENDING PAYLOAD')
                                        console.log(`case-7: 08...seding payload ->emit event === ${pushEnvelop7.pushData.emittEvent}`)
                                        console.log('--------------------------------------------------------------------------')
                                        payLoad = JSON.stringify(pushEnvelop7);
                                        io.to(recepientSocketId).emit(pushEnvelop7.pushData.emittEvent, pushEnvelop7);
                                    }
                                }
    
                            }
    
                            break;
                    }
                } else {
                    console.log("@@@@@@@@@@@@@@@no valid response for recepientData@@@@@@@@@@@@@@@@@")
                }
                
            })
        }

    }

    async destinationSocket(recepient: ICommConversationSub) {
        console.log("SioService::destinationSocket()/recepient):", recepient)
        const k = recepient.cdObjId.resourceGuid
        // return await pubClient.get(key, (err, socketDataStr) => {
        //     if (err) throw err;
        //     const recepientData: ICommConversationSub = JSON.parse(socketDataStr);
        //     const rs = recepientData.cdObjId.socketId;
        //     console.log('recepientSocket:', rs);
        //     return rs;
        // });
        return await this.b.wsRedisRead(k);
    }

    async getRooms(io) {
        const rooms = await io.of('/').adapter.allRooms();
        console.log(rooms); // a Set containing all rooms (across every node)
        return rooms;
    }

    shallow<T extends object>(source: T): T {
        // return {
        //     ...source,
        // }
        ///////////////////////////////////////
        const copy = {} as T
        Object.keys(source).forEach((key) => {
            copy[key as keyof T] = source[key as keyof T]
        })
        return copy
        ////////////////////////////////////////////
    }

    testColouredLogs() {
        // console.log(green('This is a green string!'));
        // console.log(color.green('This is a green string!'));
        // console.log(color('This is a green string!', 'green'));

        // // chained styles
        // console.log(blue.bgRed.bold.underline('Hello world!'));

        // // log
        // log('This is a green string!', 'green');
        // log.green('This is a green string!', 'This is a green string!');

        // helpers
        // console.log('isSupported:', clc.isSupported());
        // clc.disable();
        // console.log('isSupported(after disabled):', clc.isSupported());
        // clc.enable();
        // console.log('isSupported(after enabled):', clc.isSupported());

        // const greenstr = clc.green('This is a green string!');
        // const striped = clc.strip(greenstr);
        // console.log(greenstr, ' ==> [striped]', striped);

        // nested
        // console.log(cyan.bgRed.bold.underline('Hello world!'));
        // console.log(bold.cyan.bgRed.underline('Hello world!'));

        // console.log(
        //     red(`a red ${white('white')} red ${red('red')} red ${gray('gray')} red ${red('red')} red ${red('red')}`)
        // );
    }

}