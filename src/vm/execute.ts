import { FunctionType, Module, Function, ValueType, ConstantInstruction, Instruction, ExternalType } from "./structure";

// https://webassembly.github.io/spec/core/exec/runtime.html#values
type Value = ConstantInstruction;

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-funcaddr
type Address = number;
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
type ExternalValue = FunctionAddress;

// https://webassembly.github.io/spec/core/exec/runtime.html#syntax-moduleinst
interface ModuleInstance {
    types: FunctionType[],
    functionAddress: Address[];
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
interface Store {
    functions: FunctionInstance[],
}

// https://webassembly.github.io/spec/core/exec/runtime.html#stack
type StackEntry = Value | Activation;
type Stack = StackEntry[];

// https://webassembly.github.io/spec/core/exec/runtime.html#labels
type Label = Instruction[];

// https://webassembly.github.io/spec/core/exec/runtime.html#activations-and-frames
interface Frame {
    locals: Value[],
    module: ModuleInstance
}
type Activation = Frame[];



// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-store-init
export function initStore(): Store {
    return {
        functions: []
    };
}

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

    const functionAddresses: FunctionAddress[] = [];
    for (const fn of module.functions) {
        functionAddresses.push(allocateFunction(fn, store, moduleInstance));
    }

    for (const exported of module.exports) {
        const exportedType = exported.descriptor.type;
        
        let externalValue: ExternalValue; 
        if (exportedType === 'function') {
            externalValue = {
                type: 'function',
                address: functionAddresses[exported.descriptor.index].address,
            }
        }
    }

    return moduleInstance;
}

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-instantiate
// https://webassembly.github.io/spec/core/exec/modules.html#exec-instantiation
export function instantiateModule(store: Store, module: Module): ModuleInstance {
    return allocateModule(store, module);
}