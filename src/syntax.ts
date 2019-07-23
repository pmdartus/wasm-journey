// https://webassembly.github.io/spec/core/syntax/types.html#syntax-valtype
export enum ValueType {
    i32,
    i64,
    f32,
    f64,
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#expressions
export interface Expression {
    // TODO
}

// https://webassembly.github.io/spec/core/syntax/modules.html#functions
export interface Function {
    type: number;
    locals: ValueType[];
    body: Expression;
}

// https://webassembly.github.io/spec/core/syntax/types.html#function-types
export interface FunctionType {
    params: ValueType[];
    results: ValueType[];
}

// https://webassembly.github.io/spec/core/syntax/modules.html#exports
export interface Export {
    name: string;
    desc: number;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#modules
export interface Module {
    types: FunctionType[];
    funcs: Function[];
    exports: Export[];
}
