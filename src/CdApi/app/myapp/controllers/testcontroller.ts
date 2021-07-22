
import { AppController } from '../../../sys/base/app.controller';

interface IPerson {
    id: number;
    name: string;
}
type PersonPropertyName = keyof IPerson;
///////////////
type StringOrNumber = string[] | number[];
export class TestController {
    constructor() {
        // super(); // used for initiating base class
        this.getProperty(
            'id',
            { id: 1, name: 'firstName' }
        );
        this.getProperty(
            'name',
            { id: 2, name: 'secondName' }
        );
        // this.getProperty(
        //     'telephone',
        //     { id: 3, name: 'thirdName' }
        // );
    }
    concatWithDefault1(a: string, b?: string) {
        console.log(`a + b = ${a + (b ?? '')}`);
    }

    concatWithDefault2(a: string, b: string = 'default') {
        console.log(`a + b = ${a + b}`);
    }

    /**
     *
     * @param args //ambigous arguments
     */
    testArguments(...args: StringOrNumber) {
        for (const i in args) {
            if (args) {
                console.log(`args[${i}] = ${args[i]}`);
            }
        }
    }

    ////////////////////
    // Call back functions

    /**
     *
     * @param text: string
     */
    myCallback1 = (text: string): void => {
        console.log('myCallback1 called with ' + text);
    }

    myCallback2(text: string): void {
        console.log(`myCallback2 called with ${text}`);
    }

    /**
     * Usage: withCallbackArg('initial text', myCallback1);
     * @param message: string
     * @param callbackFn
     */
    withCallbackArg(
        message: string,
        callbackFn: (text: string) => void
    ) {
        console.log('withCallback called, message : ' + message);
        if (typeof (callbackFn instanceof Function)) { // type guard
            callbackFn(message + ' from withCallback');
        }
    }

    /////////////////////////////
    // function override

    add(a: string, b: string): string;
    add(a: number, b: number): number;
    add(a: any, b: any) {
        return a + b;
    }
    ///////////////
    // interfaces
    getProperty(key: PersonPropertyName, value: IPerson) {
        console.log(`${key} = ${value[key]}`);
    }

    delayedResponseWithCallback(callback: () => void) {
        function executeAfterTimeout() {
            console.log(`5. executeAfterTimeout()`);
            callback();
        }
        console.log(`2. calling setTimeout`)
        setTimeout(executeAfterTimeout, 1000);
        console.log(`3. after calling setTimeout`)
    }

    testDelayResp(){
        this.delayedResponseWithCallback(
            () => {
                this.testFn();
            });
    }

    testFn(): void {
        console.log('this is testFn()');
    }
}