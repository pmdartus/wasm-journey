import * as wasm from './vm/main';
import {
    module_decode,
    module_validate,
    module_instantiate,
    module_exports,
    store_init,
} from './vm/main';

// TODO: add missing types
interface Instance {}

// https://webassembly.github.io/spec/js-api/#enumdef-importexportkind
type ImportExportKind = 'function' | 'table' | 'memory' | 'global';

// https://webassembly.github.io/spec/js-api/#dictdef-moduleexportdescriptor
interface ModuleExportsDescriptor {
    name: string;
    kind: ImportExportKind;
}

// https://webassembly.github.io/spec/js-api/#dictdef-webassemblyinstantiatedsource
interface InstantiatedSource {
    instance: Instance;
    module: Module;
}

class CompilerError extends Error {
    get name() {
        return 'CompilerError';
    }
}

class Module {
    _module: wasm.Module;
    _bytes: ArrayBuffer;

    // https://webassembly.github.io/spec/js-api/#dom-module-module
    constructor(bytes: ArrayBuffer) {
        const stableBytes = bytes.slice(0);

        const { err, res } = compileWasmModule(stableBytes);
        if (err) {
            throw new CompilerError(err.message);
        }

        this._module = res!;
        this._bytes = bytes;
    }

    // https://webassembly.github.io/spec/js-api/#dom-module-exports
    static exports(module: Module): ModuleExportsDescriptor[] {
        return module_exports(module._module).map(([name, kind]) => {
            // TODO: Improve type guard here.
            return {
                name,
                kind,
            } as ModuleExportsDescriptor;
        });
    }
}

// https://webassembly.github.io/spec/js-api/#associated-store
// Each agent have an associated store. In this case here, we create a single global store.
let AGENT_STORE = store_init();

function copyBufferSource(bufferSource: BufferSource): ArrayBuffer {
    return bufferSource instanceof ArrayBuffer
        ? bufferSource.slice(0)
        : bufferSource.buffer.slice(0);
}

// https://webassembly.github.io/spec/js-api/#compile-a-webassembly-module
function compileWasmModule(
    bytes: ArrayBuffer,
): { res?: wasm.Module; err?: Error } {
    let module;
    try {
        module = module_decode(bytes);
    } catch (err) {
        return { err };
    }

    try {
        module_validate(module);
    } catch (err) {
        return { err };
    }

    return { res: module };
}

// https://webassembly.github.io/spec/js-api/#dom-webassembly-validate
function validate(bytes: BufferSource): boolean {
    const stabledBytes = copyBufferSource(bytes);
    const { err } = compileWasmModule(stabledBytes);

    return err ? false : true;
}

// https://webassembly.github.io/spec/js-api/#asynchronously-compile-a-webassembly-module
function asyncCompileWasmModule(bytes: ArrayBuffer): Promise<Module> {
    const { err, res } = compileWasmModule(bytes);

    if (err) {
        return Promise.reject(new CompilerError(err.message));
    }

    const module: Module = {
        _bytes: bytes,
        _module: res!
    };
    Object.setPrototypeOf(module, Module.prototype);

    return Promise.resolve(module);
}

// https://webassembly.github.io/spec/js-api/#dom-webassembly-compile
function compile(bytes: BufferSource): Promise<Module> {
    const staledBytes = copyBufferSource(bytes);
    return asyncCompileWasmModule(staledBytes);
}

function readImports(module: wasm.Module, importObject: any) {
    if (module.imports.length > 0 && importObject === undefined) {
        throw new TypeError('Invalid import object');
    }

    // TODO
}

// https://webassembly.github.io/spec/js-api/#asynchronously-instantiate-a-webassembly-module
function instantiateCoreWasmModule(module: wasm.Module, imports: any): wasm.ModuleInstance {
    const store = AGENT_STORE;
    const result = module_instantiate(store, module);

    // TODO: Error handling

    AGENT_STORE = store;
    return result;
}

// https://webassembly.github.io/spec/js-api/#asynchronously-instantiate-a-webassembly-module
function asyncInstantiateWasmModule(module: Module, importObject: any): Promise<Instance> {
    const imports = readImports(module._module, importObject);

    let instance;
    try {
        instance = instantiateCoreWasmModule(module._module, imports);
    } catch (error) {
        return Promise.reject(error);
    }

}

// https://webassembly.github.io/spec/js-api/#instantiate-a-webassembly-module
function instantiateWasmModule() {
    // TODO
}

// https://webassembly.github.io/spec/js-api/#instantiate-a-promise-of-a-module
function instantiateModulePromise(
    modulePromise: Promise<Module>,
    imports: any,
): Promise<InstantiatedSource> {
    return modulePromise.then(module => {
        // TODO
        return {} as any;
    });
}

// https://webassembly.github.io/spec/js-api/#dom-webassembly-instantiate
// https://webassembly.github.io/spec/js-api/#dom-webassembly-instantiate-moduleobject-importobject
function instantiate(module: Module, importObject?: any): Promise<Instance>
function instantiate(bytes: BufferSource, importObject?: any): Promise<InstantiatedSource>
function instantiate(input: Module | BufferSource, importObject?: any): Promise<Instance | InstantiatedSource> {
    if (input instanceof Module) {
        return asyncInstantiateWasmModule(input, importObject);
    } else {
        const staledBytes = copyBufferSource(input);
        const modulePromise = asyncCompileWasmModule(staledBytes);
        return instantiateModulePromise(modulePromise, importObject);
    }

}

export default {
    validate,
    compile,
    instantiate,

    CompilerError,
};
