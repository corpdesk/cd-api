import { ClassRef } from '../../../sys/base/IBase';
export function simpleClsDecorator(constructor: ClassRef) {
    console.log('simpleDecorator called');
}

export function simpleFnDecorator(constructor: () => void) {
    console.log('simpleDecorator called');
}

// export function simpleDecorator(constructor: Function) {
//     console.log('simpleDecorator called');
// }

/////////////
export function classDecorator(constructor: ClassRef) {
    console.log('classDecorator called');
}

export function propertyDecorator(
    target: any,
    propertyKey: string
) {
    console.log('propertyDecorator called');
}

export function methodDecorator(
    target: any,
    methodName: string,
    descriptor?: PropertyDescriptor) {
    console.log('propertyDecorator called');
}

export function parameterDecorator(
    target: any,
    methodName: string,
    parameterIndex: number) {
    console.log('propertyDecorator called');

}

function decoratorFactory(name: string) {
    return (constructor: ClassRef) => {
        console.log(`decorator function called with : ${name}`);
    }
}