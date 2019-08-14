import { Module, FunctionType } from './structure';
import { Store, ModuleInstance, ExternalValue, Address, Value } from './execute';

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-exports
export function module_exports(module: Module): [string, string][] {
    return module.exports.map(e => [e.name, e.descriptor.type]);
}

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-instance-export
export function instance_export(instance: ModuleInstance, name: string): ExternalValue {
    const matchingExport = instance.exports.find(e => e.name === name);

    if (matchingExport !== undefined) {
        return matchingExport.value;
    } else {
        throw new Error('Invalid export name.');
    }
}

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-store-init
export function store_init(): Store {
    return {
        functions: [],
    };
}


// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-func-type
export function func_type(store: Store, functionAddress: Address): FunctionType {
    return store.functions[functionAddress].type;
}

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-func-invoke
export function func_invoke(store: Store, functionAddress: Address, values: Value[]): { store: Store, ret: Value[] | Error } {

}