"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyController = void 0;
// import { simpleDecorator } from '../decorators/decos';
// @simpleDecorator
var MyController = /** @class */ (function () {
    function MyController() {
        console.log('..');
    }
    MyController.prototype.Foo = function () {
        console.log('starting Foo');
        return { foo: [] };
    };
    MyController.prototype.print = function () {
        console.log("MyController.print() called.");
    };
    ;
    /**
     * method that can print using IPrint,
     * ...so long as it is an instance of
     * class has implmented/inherited IPrint
     * @param c
     */
    MyController.prototype.printClass = function (c) {
        c.print();
    };
    return MyController;
}());
exports.MyController = MyController;
//# sourceMappingURL=mycontroller.js.map