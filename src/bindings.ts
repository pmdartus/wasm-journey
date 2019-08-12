import { module_decode, module_validate, module_instantiate } from './vm/main';

// TODO: add missing types
interface Instance {}
interface Module {}

interface InstantiateResult {
    instance: Instance;
    module: Module;
}

function copyBufferSource(bufferSource: BufferSource): ArrayBuffer {
    return bufferSource instanceof ArrayBuffer
        ? bufferSource.slice(0)
        : bufferSource.buffer.slice(0);
}

class CompilerError extends Error {
    get name() {
        return 'CompilerError';
    }
}

// https://webassembly.github.io/spec/js-api/#compile-a-webassembly-module
function compileWasmModule(bytes: ArrayBuffer): Module {
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

// https://webassembly.github.io/spec/js-api/#asynchronously-compile-a-webassembly-module
function asyncCompileWasmModule(bytes: ArrayBuffer): Promise<Module> {
    compileWasmModule(bytes);

    // TODO

    return Promise.resolve({});
}

// https://webassembly.github.io/spec/js-api/#instantiate-a-webassembly-module
function instantiateWasmModule() {
    // TODO
}

// https://webassembly.github.io/spec/js-api/#instantiate-a-promise-of-a-module
function instantiateModulePromise(modulePromise: Promise<Module>, imports: any): Promise<InstantiateResult> {
    return modulePromise.then(module => {
        // TODO
        return {} as any;
    });
}

// https://webassembly.github.io/spec/js-api/#dom-webassembly-instantiate
function instantiate(
    bufferSource: BufferSource,
    importObject: any = {},
): Promise<InstantiateResult> {
    const staledBytes = copyBufferSource(bufferSource);
    const modulePromise = asyncCompileWasmModule(staledBytes);
    return instantiateModulePromise(modulePromise, importObject);
}

export default {
    instantiate,

    CompilerError
};
