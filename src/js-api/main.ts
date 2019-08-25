import { Table } from './tables';
import { Module } from './modules';
import { Global } from './globals';
import { Memory } from './memories';
import { Instance } from './instances';
import { CompileError, LinkError, RuntimeError } from './errors';

import { validate, compile, instantiate, InstantiatedSource } from './shared';

type WebAssemblyNamespace = typeof WebAssembly;

// Since rollup mangles the identifiers conflicting identifier names, we rewrap the methods to
// keep the function.name property intact. For instance avoiding the "validate" function name to
// become "validate$1".
const WebAssemblyObject = {
    validate(bytes: BufferSource): boolean {
        return validate(bytes);
    },
    async compile(bytes: BufferSource): Promise<Module> {
        return compile(bytes);
    },
    async instantiate(
        input: any,
        importObject: any = {},
    ): Promise<Instance | InstantiatedSource> {
        return instantiate(input, importObject);
    },
} as any as WebAssemblyNamespace;

const constructorMapping = {
    CompileError: CompileError,
    LinkError: LinkError,
    RuntimeError: RuntimeError,
    Module: Module,
    Instance: Instance,
    Memory: Memory,
    Table: Table,
    Global: Global,
};
for (const [name, value] of Object.entries(constructorMapping)) {
    Object.defineProperty(WebAssemblyObject, name, {
        value,
        configurable: true,
        writable: true,
    });
}

export default WebAssemblyObject;
