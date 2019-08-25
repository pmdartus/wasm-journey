type ValueType = 'i32' | 'i64' | 'f32' | 'f64';

interface GlobalDescriptor {
    value: ValueType;
    mutable?: boolean;
}

export class Global {
    value: any;

    constructor(descriptor: GlobalDescriptor, value: any) {}
    valueOf(): any {}
}