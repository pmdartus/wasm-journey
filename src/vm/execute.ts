import { FunctionType, Module, Function, ValueType, ConstantInstruction, Instruction, ExternalType } from "./structure";

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
    types: FunctionType[],
    functionAddress: FunctionAddress[];
    exports: ExportInstance[];
}

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-funcinst
type FunctionInstance = {
    type: FunctionType,
    module: ModuleInstance,
    code: Function,
} | {
    type: FunctionType,
    hostCode: FunctionInstance
};

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-store
export interface Store {
    functions: FunctionInstance[],
}

// https://webassembly.github.io/spec/core/exec/runtime.html#stack
type StackEntry = Value | Activation | Frame;
type Stack = StackEntry[];

// https://webassembly.github.io/spec/core/exec/runtime.html#labels
type Label = Instruction[];

// https://webassembly.github.io/spec/core/exec/runtime.html#activations-and-frames
interface Frame {
    locals: Value[],
    module: ModuleInstance
}
type Activation = Frame;

// Make a global stack for now, but not sure if it is the best idea.
const STACK: Stack = [];

// https://webassembly.github.io/spec/core/exec/modules.html#alloc-func
function allocateFunction(fn: Function, store: Store, moduleInstance: ModuleInstance): FunctionAddress {
    const functionAddress: FunctionAddress = {
        type: 'function',
        address: store.functions.length
    };
    
    const functionType = moduleInstance.types[fn.type.index];
    store.functions.push({
        type: functionType,
        module: moduleInstance,
        code: fn
    });

    return functionAddress;
}

// https://webassembly.github.io/spec/core/exec/modules.html#alloc-module
function allocateModule(store: Store, module: Module): ModuleInstance {
    const moduleInstance: ModuleInstance = {
        types: module.types,
        functionAddress: [],
        exports: []
    };

    for (const fn of module.functions) {
        moduleInstance.functionAddress.push(allocateFunction(fn, store, moduleInstance));
    }

    for (const exported of module.exports) {
        const { name, descriptor: { type } } = exported;
        
        let externalValue: ExternalValue; 
        if (type === 'function') {
            externalValue = {
                type: 'function',
                address: moduleInstance.functionAddress[exported.descriptor.index].address,
            }
        } else {
            throw new Error('Invalid export type');
        }

        moduleInstance.exports.push({
            name,
            value: externalValue
        });
    }

    return moduleInstance;
}

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-instantiate
// https://webassembly.github.io/spec/core/exec/modules.html#exec-instantiation
export function instantiateModule(store: Store, module: Module): ModuleInstance {
    return allocateModule(store, module);
}

// https://webassembly.github.io/spec/core/exec/instructions.html#exec-invoke
function invokeFunction(functionAddress: Address) {

}

// https://webassembly.github.io/spec/core/exec/modules.html#exec-invocation
export function invoke(store: Store, functionAddress: Address, values: Value[]): { store: Store, ret: Value[] | Error } {
    // TODO: transform to assert
    if (store.functions[functionAddress] === undefined) {
        throw new TypeError('Invalid function address');
    }

    const functionInstance = store.functions[functionAddress]
    
    const { params } = functionInstance.type;
    if (params.length !== values.length) {
        throw new TypeError('Invalid parameter length');
    }

    for (let i = 0; i < params.length; i++) {
        const type = params[i];
        const constant = values[i];

        // TODO: reuse the same opcodes
        if (
            (type === ValueType.i32 && constant.opcode !== 0x41) ||
            (type === ValueType.i64 && constant.opcode !== 0x42) ||
            (type === ValueType.f32 && constant.opcode !== 0x43) ||
            (type === ValueType.f64 && constant.opcode !== 0x44) 
        ) {
            throw new TypeError('Type mismatch')
        }
    }

    const frame: Frame = {
        locals: [],
        module: {
            exports: [],
            functionAddress: [],
            types: []
        }
    };

    STACK.push(frame);
    STACK.push(...values);

    invokeFunction(functionAddress);

    // TODO
}