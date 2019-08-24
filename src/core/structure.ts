// https://webassembly.github.io/spec/core/syntax/values.html#syntax-byte
export type Byte = number;

// https://webassembly.github.io/spec/core/syntax/types.html#syntax-valtype
export enum ValueType {
    i32,
    i64,
    f32,
    f64,
}

// https://webassembly.github.io/spec/core/syntax/types.html#result-types
export type ResultType = ValueType[];

// https://webassembly.github.io/spec/core/syntax/types.html#function-types
export interface FunctionType {
    params: ValueType[];
    results: ValueType[];
}

// https://webassembly.github.io/spec/core/syntax/types.html#limits
export interface Limits {
    min: number;
    max?: number;
}

// https://webassembly.github.io/spec/core/syntax/types.html#memory-types
export type MemoryType = Limits;

// https://webassembly.github.io/spec/core/syntax/types.html#syntax-limits
export interface TableType {
    // TODO
}

// https://webassembly.github.io/spec/core/syntax/types.html#global-types
export interface GlobalType {
    // TODO
}

// https://webassembly.github.io/spec/core/syntax/types.html#external-types
export interface ExternalType {
    // TODO
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#instructions
export type Instruction = NumericInstruction | ConstantInstruction | VariableInstruction;

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
export interface NumericInstruction {
    opcode: Byte;
}
export interface ConstantInstruction {
    opcode: Byte;
    value: number;
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#variable-instructions
export interface VariableInstruction {
    opcode: Byte;
    index: Index;
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#expressions
export interface Expression {
    instructions: Instruction[];
}

// https://webassembly.github.io/spec/core/syntax/modules.html#modules
export interface Module {
    types: FunctionType[];
    functions: Function[];
    tables: Table[];
    memories: Memory[];
    globals: Global[];
    elements: Element[];
    datas: Data[];
    start?: Start;
    imports: Import[];
    exports: Export[];
}

// https://webassembly.github.io/spec/core/syntax/modules.html#indices
export type Index = number;
export interface TypeIndex {
    type: 'type';
    index: Index;
}
export interface FunctionIndex {
    type: 'function';
    index: Index;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#functions
export interface Function {
    type: TypeIndex;
    locals: ValueType[];
    body: Expression;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#tables
export interface Table {
    type: TableType;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#memories
export interface Memory {
    type: MemoryType;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#globals
export interface Global {
    type: GlobalType;
    initializer: Expression;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#data-segments
export interface Data {
    data: Index;
    offset: Expression;
    initializer: Byte[];
}

// https://webassembly.github.io/spec/core/syntax/modules.html#start-function
export interface Start {
    function: Index;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#exports
export interface Export {
    name: string;
    descriptor: FunctionIndex;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#imports
export interface Import {
    module: string;
    name: string;
}
