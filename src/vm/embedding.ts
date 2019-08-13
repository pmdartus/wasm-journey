import { Store } from './execute';
import { Module } from './structure';

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-exports
export function module_exports(module: Module): [string, string][] {
    return module.exports.map(e => [e.name, e.descriptor.type]);
}

// https://webassembly.github.io/spec/core/appendix/embedding.html#embed-store-init
export function store_init(): Store {
    return {
        functions: [],
    };
}
