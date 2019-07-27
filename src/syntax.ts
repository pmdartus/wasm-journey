// https://webassembly.github.io/spec/core/syntax/types.html#syntax-valtype
export enum ValueType {
    i32,
    i64,
    f32,
    f64,
}

export enum IndexType {
    function,
    table,
    memory,
    global,
}

export interface Index<T extends IndexType> {
    type: IndexType.function;
    index: T;
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#instructions
export type Instruction = PrimaryExpression | UnaryInstruction | BinaryInstruction;

export interface PrimaryExpression {
    type: 'primary';
    opcode: number;
}

export interface UnaryInstruction {
    type: 'unary';
    opcode: number;
    param: ValueType;
}

export interface BinaryInstruction {
    type: 'binary';
    opcode: number;
    param1: ValueType;
    param2: ValueType;
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#expressions
export interface Expression {
    instructions: Instruction[]
}

// https://webassembly.github.io/spec/core/syntax/types.html#function-types
export interface FunctionType {
    params: ValueType[];
    results: ValueType[];
}

// https://webassembly.github.io/spec/core/syntax/modules.html#exports
export interface Export {
    name: string;
    desc:
        | Index<IndexType.function>
        | Index<IndexType.table>
        | Index<IndexType.memory>
        | Index<IndexType.global>;
}

// https://webassembly.github.io/spec/core/binary/modules.html#code-section
export interface Code {
    locals: ValueType[];
    body: Expression;
}

// https://webassembly.github.io/spec/core/syntax/modules.html#modules
export interface Module {
    types: FunctionType[];
    funcs: Index<IndexType.function>[];
    exports: Export[];
    codes: Code[];
}
