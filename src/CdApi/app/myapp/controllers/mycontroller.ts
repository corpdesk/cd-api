import { IPrint } from '../interfaces/myapp.interface';
// import { simpleDecorator } from '../decorators/decos';

// @simpleDecorator

export class MyController implements IPrint {
    constructor() {
        console.log('..');
    }

    Foo() {
        console.log('starting Foo');
        return { foo: [] };
    }

    print(): void {
        console.log(`MyController.print() called.`)
    };

    /**
     * method that can print using IPrint,
     * ...so long as it is an instance of
     * class has implmented/inherited IPrint
     * @param c
     */
    printClass(c: IPrint) {
        c.print();
    }
}

