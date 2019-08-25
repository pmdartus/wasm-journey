import { makePropertiesEnumerable } from './utils';

type ValueType = 'i32' | 'i64' | 'f32' | 'f64';

interface GlobalDescriptor {
    value: ValueType;
    mutable?: boolean;
}

// https://webassembly.github.io/spec/js-api/#global
export class Global {
    // https://webassembly.github.io/spec/js-api/#dom-global-global
    constructor(descriptor: GlobalDescriptor, value: any) {}

    // https://webassembly.github.io/spec/js-api/#dom-global-valueof
    valueOf(): any {}

    // https://webassembly.github.io/spec/js-api/#dom-global-value
    get value() {
        return;
    }
    set value(v: any) {}
}

makePropertiesEnumerable(Global.prototype, ['valueOf', 'value']);