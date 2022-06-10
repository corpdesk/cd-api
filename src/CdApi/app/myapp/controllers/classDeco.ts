import {
    classDecorator,
    propertyDecorator,
    methodDecorator,
    parameterDecorator
} from '../decorators/decos';

@classDecorator
export class ClassWithAllTypesOfDecorators {
    @propertyDecorator
    id: number = 1;

    @methodDecorator
    print() {
        console.log('...');
    }
    setId(@parameterDecorator id: number) {
        console.log('...');
    }
}
