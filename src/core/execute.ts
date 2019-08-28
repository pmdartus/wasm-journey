import {
    FunctionType,
    Module,
    Function,
    ValueType,
    ConstantInstruction,
    Instruction,
    LocalInstruction,
} from './structure';
import { OpCode } from './constants';

// https://webassembly.github.io/spec/core/exec/runtime.html#values
export type Value = ConstantInstruction;

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-funcaddr
export type Address = number;
interface FunctionAddress {
    type: 'function';
    address: Address;
}

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-exportinst
interface ExportInstance {
    name: string;
    value: ExternalValue;
}

// https://webassembly.github.io/spec/core/exec/runtime.html#external-values
export type ExternalValue = FunctionAddress;

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-moduleinst
export interface ModuleInstance {
    types: FunctionType[];
    functionAddress: FunctionAddress[];
    exports: ExportInstance[];
}

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-funcinst
type FunctionInstance =
    | {
          type: FunctionType;
          module: ModuleInstance;
          code: Function;
      }
    | {
          type: FunctionType;
          hostCode: FunctionInstance;
      };

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-store
export interface Store {
    functions: FunctionInstance[];
}

// https://webassembly.github.io/spec/core/exec/runtime.html#stack
type StackEntry = Value | Activation | Label;
type Stack = StackEntry[];

// https://webassembly.github.io/spec/core/exec/runtime.html#labels
type Label = {
    arity: number;
    continuation: Instruction[];
};

// https://webassembly.github.io/spec/core/exec/runtime.html#activations-and-frames
interface Frame {
    locals: Value[];
    module: ModuleInstance;
}
type Activation = {
    arity: number;
    frame: Frame;
};

// Make a global stack for now, but not sure if it is the best idea.
const STACK: Stack = [];

// https://webassembly.github.io/spec/core/exec/modules.html#alloc-func
function allocateFunction(
    fn: Function,
    store: Store,
    moduleInstance: ModuleInstance,
): FunctionAddress {
    const functionAddress: FunctionAddress = {
        type: 'function',
        address: store.functions.length,
    };

    const functionType = moduleInstance.types[fn.type.index];
    store.functions.push({
        type: functionType,
        module: moduleInstance,
        code: fn,
    });

    return functionAddress;
}

// https://webassembly.github.io/spec/core/exec/modules.html#alloc-module
function allocateModule(store: Store, module: Module): ModuleInstance {
    const moduleInstance: ModuleInstance = {
        types: module.types,
        functionAddress: [],
        exports: [],
    };

    for (const fn of module.functions) {
        moduleInstance.functionAddress.push(
            allocateFunction(fn, store, moduleInstance),
        );
    }

    for (const exported of module.exports) {
        const {
            name,
            descriptor: { type },
        } = exported;

        let externalValue: ExternalValue;
        if (type === 'function') {
            externalValue = {
                type: 'function',
                address:
                    moduleInstance.functionAddress[exported.descriptor.index]
                        .address,
            };
        } else {
            throw new Error('Invalid export type');
        }

        moduleInstance.exports.push({
            name,
            value: externalValue,
        });
    }

    return moduleInstance;
}

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-instantiate
// https://webassembly.github.io/spec/core/exec/modules.html#exec-instantiation
export function instantiateModule(
    store: Store,
    module: Module,
): ModuleInstance {
    return allocateModule(store, module);
}

function currentFrame(): Frame {
    let frame: Frame;

    for (let i = STACK.length - 1; i >= 0; i--) {
        const stackEntry = STACK[i];
        if ('frame' in stackEntry) {
            frame = stackEntry.frame;
            break;
        }
    }

    return frame!;
}

// https://webassembly.github.io/spec/core/bikeshed/index.html#instructions%E2%91%A4
function executeInstruction(store: Store, instructions: Instruction[]) {
    for (const instruction of instructions) {
        switch (instruction.opcode) {
            // TODO: refactor this
            // https://webassembly.github.io/spec/core/bikeshed/index.html#-hrefsyntax-instr-variablemathsflocalgetx%E2%91%A0
            case OpCode.GetLocal:
                const frame = currentFrame();
                const { index } = (instruction as LocalInstruction).localIndex;
                const val = frame.locals[index];
                STACK.push(val);
                break;

            // https://webassembly.github.io/spec/core/bikeshed/index.html#exec-binop
            // https://webassembly.github.io/spec/core/bikeshed/index.html#op-iadd
            case OpCode.I32Add:
                const c2 = STACK.pop() as Value;
                const c1 = STACK.pop() as Value;
                const c: Value = {
                    opcode: ValueType.i32,
                    value: c1.value + c2.value,
                };
                STACK.push(c);
                break;

            default:
                break;
        }
    }

    exitInstructionBlock(store);
}

// https://webassembly.github.io/spec/core/exec/instructions.html#exec-instr-seq-enter
function enterInstructionBlock(
    store: Store,
    instructions: Instruction[],
    label: Label,
) {
    STACK.push(label);
    executeInstruction(store, instructions);
}

function exitInstructionBlock(store: Store) {
    const values: Value[] = [];
    while ('opcode' in STACK[STACK.length - 1]) {
        values.push(STACK.pop() as Value);
    }

    const _label = STACK.pop();

    STACK.push(...values);
}

// https://webassembly.github.io/spec/core/exec/instructions.html#exec-block
function executeBlock(
    store: Store,
    arity: number,
    instructions: Instruction[],
) {
    const label: Label = {
        arity,
        continuation: [instructions[instructions.length - 1]],
    };

    enterInstructionBlock(store, instructions, label);
}

// https://webassembly.github.io/spec/core/exec/instructions.html#exec-invoke
function invokeFunction(store: Store, functionAddress: Address) {
    const functionInstance = store.functions[functionAddress];
    const { params, results } = functionInstance.type;

    // TODO: Find a better way to represent hostCode.
    if (!('code' in functionInstance)) {
        throw new Error();
    }

    const { locals, body } = functionInstance.code;

    const parameterValues: Value[] = [];
    for (let i = 0; i < params.length; i++) {
        parameterValues.push(STACK.pop() as Value);
    }

    const localValues: Value[] = [];
    for (let i = 0; i < locals.length; i++) {
        const type = locals[i];

        // TODO: Find a better way to do this
        let opcode: number;
        switch (type) {
            case ValueType.i32:
                opcode = OpCode.I32Const;
                break;

            case ValueType.i64:
                opcode = OpCode.I64Const;
                break;

            case ValueType.f32:
                opcode = OpCode.F32Const;
                break;

            case ValueType.f64:
                opcode = OpCode.F64Const;
                break;

            default:
                throw new Error();
        }

        localValues.push({
            opcode,
            value: 0,
        });
    }

    const activation: Activation = {
        arity: results.length,
        frame: {
            module: functionInstance.module,
            locals: [...parameterValues, ...localValues],
        },
    };
    STACK.push(activation);

    executeBlock(store, results.length, body.instructions);
}

// https://webassembly.github.io/spec/core/exec/modules.html#exec-invocation
export function invoke(
    store: Store,
    functionAddress: Address,
    values: Value[],
): { store: Store; ret: Value[] | Error } {
    // TODO: transform to assert
    if (store.functions[functionAddress] === undefined) {
        throw new TypeError('Invalid function address');
    }

    const functionInstance = store.functions[functionAddress];
    const { params, results } = functionInstance.type;

    if (params.length !== values.length) {
        throw new TypeError('Invalid parameter length');
    }

    for (let i = 0; i < params.length; i++) {
        const type = params[i];
        const constant = values[i];

        if (
            (type === ValueType.i32 && constant.opcode !== OpCode.I32Const) ||
            (type === ValueType.i64 && constant.opcode !== OpCode.I64Const) ||
            (type === ValueType.f32 && constant.opcode !== OpCode.F32Const) ||
            (type === ValueType.f64 && constant.opcode !== OpCode.F64Const)
        ) {
            throw new TypeError('Type mismatch');
        }
    }

    const frame: Activation = {
        arity: 0,
        frame: {
            locals: [],
            module: {
                exports: [],
                functionAddress: [],
                types: [],
            },
        },
    };
    STACK.push(frame);
    STACK.push(...values);

    invokeFunction(store, functionAddress);

    const ret: Value[] = [];
    for (let i = 0; i < results.length; i++) {
        ret.push(STACK.pop() as Value);
    }

    return { store, ret };
}
