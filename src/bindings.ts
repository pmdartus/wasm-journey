import * as wasm from './vm/main';
import {
    module_decode,
    module_validate,
    module_instantiate,
    module_exports,
    store_init,
    instance_export,
    func_type,
} from './vm/main';

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

// https://webassembly.github.io/spec/js-api/#compileerror
class CompilerError extends Error {
    get name() {
        return 'CompilerError';
    }
}

// https://webassembly.github.io/spec/js-api/#runtimeerror
class RuntimeError extends Error {
    get name() {
        return 'RuntimeError';
    }
}

// https://webassembly.github.io/spec/js-api/#module
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

// https://webassembly.github.io/spec/js-api/#instance
class Instance {
    readonly exports: any;

    constructor(module: Module, importObject: any) {
        return instantiateWasmModule(module, importObject);
    }
}

// https://webassembly.github.io/spec/js-api/#associated-store
// Each agent have an associated store. In this case here, we create a single global store.
let AGENT_STORE = store_init();

// https://webassembly.github.io/spec/js-api/#object-caches
const EXPORTED_FUNCTION_CACHE: { [address: number]: Function } = {};

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
        _module: res!,
    };
    Object.setPrototypeOf(module, Module.prototype);

    return Promise.resolve(module);
}

// https://webassembly.github.io/spec/js-api/#dom-webassembly-compile
function compile(bytes: BufferSource): Promise<Module> {
    const staledBytes = copyBufferSource(bytes);
    return asyncCompileWasmModule(staledBytes);
}

// https://webassembly.github.io/spec/js-api/#read-the-imports
function readImports(module: wasm.Module, importObject: any) {
    if (module.imports.length > 0 && importObject === undefined) {
        throw new TypeError('Invalid import object');
    }

    // TODO
}

// https://webassembly.github.io/spec/js-api/#name-of-the-webassembly-function
function getWasmFunctionName(functionAddress: number): string {
    // The function address is the function name in the current implementation.
    return String(functionAddress);
}

// https://webassembly.github.io/spec/js-api/#a-new-exported-function
function createExportedFunction(functionAddress: number): Function {
    if (functionAddress in EXPORTED_FUNCTION_CACHE) {
        return EXPORTED_FUNCTION_CACHE[functionAddress];
    }

    const functionType = func_type(AGENT_STORE, functionAddress);

    const functionArguments = [...functionType.params].map((_, i) => `arg${i}`);
    const functionName = getWasmFunctionName(functionAddress);

    const functionBody = `
        return function(${functionArguments.join(', ')}) {
            return steps(functionAddress, [${functionArguments.join(', ')}]);
        }
    `;

    const fn = new Function('functionAddress', 'steps', functionBody)(
        functionAddress,
        callExportedFunction,
    );

    Object.defineProperty(fn, 'name', {
        value: functionName,
        configurable: true,
    })

    EXPORTED_FUNCTION_CACHE[functionAddress] = fn;

    return fn;
}

// https://webassembly.github.io/spec/js-api/#call-an-exported-function
function callExportedFunction(functionAddress: number, argValues: any[]): any {
    const { params, results } = func_type(AGENT_STORE, functionAddress);

    if (results.includes(wasm.ValueType.i64)) {
        throw new TypeError('Invalid i64 return type');
    }

    let i = 0;
    const args: wasm.ConstantInstruction[] = [];

    for (const type of params) {
        const arg = argValues.length > i ? argValues[i] : undefined;
        args.push(toWasmValue(arg, type));
        i++;
    }

    const { store, ret } = wasm.func_invoke(AGENT_STORE, functionAddress, args);

    AGENT_STORE = store;

    if (ret instanceof Error) {
        throw new RuntimeError(ret.message);
    }

    return toJsValue(ret[0]);
}

// https://webassembly.github.io/spec/js-api/#towebassemblyvalue
function toWasmValue(value: any, type: wasm.ValueType): wasm.Value {
    // TODO: Convert to assert
    if (type === wasm.ValueType.i64) {
        throw new TypeError();
    }

    if (type === wasm.ValueType.i32) {
        // https://tc39.es/ecma262/#sec-toint32
        const int = Math.floor(Number(value));
        const int32Bits = int % 2 ** 32;
        const converted =
            int32Bits >= 2 ** 31 ? int32Bits - 2 ** 32 : int32Bits;

        // TODO: Share actual opcode
        return {
            opcode: 0x41,
            value: converted,
        };
    } else if (type === wasm.ValueType.f32) {
        const converted = Number(value);

        return {
            opcode: 0x43,
            value: converted,
        };
    } else if (type === wasm.ValueType.f64) {
        const converted = Number(value);

        return {
            opcode: 0x44,
            value: converted,
        };
    }

    throw new Error('Invalid value type');
}

function toJsValue(value: wasm.Value): any {
    // TODO: Convert to assert
    if (value.opcode === 0x42) {
        throw new TypeError();
    }

    return value.value;
}

// https://webassembly.github.io/spec/js-api/#create-an-instance-object
function createInstanceObject(
    module: wasm.Module,
    instance: wasm.ModuleInstance,
): Instance {
    const exportObject = Object.create(null);

    for (const [name, type] of module_exports(module)) {
        const externVal = instance_export(instance, name);

        let value;
        if (type === 'function') {
            const { address } = externVal;
            value = createExportedFunction(address);
        }

        exportObject[name] = value;
    }

    Object.freeze(exportObject);

    // Instantiate an Instance object without having to invoke the constructor.
    const instanceObject = Object.create(Instance.prototype);
    instanceObject.exports = exportObject;

    return instanceObject;
}

// https://webassembly.github.io/spec/js-api/#asynchronously-instantiate-a-webassembly-module
function instantiateCoreWasmModule(
    module: wasm.Module,
    imports: any,
): wasm.ModuleInstance {
    const store = AGENT_STORE;
    const result = module_instantiate(store, module);

    // TODO: Error handling

    AGENT_STORE = store;
    return result;
}

// https://webassembly.github.io/spec/js-api/#asynchronously-instantiate-a-webassembly-module
function asyncInstantiateWasmModule(
    module: Module,
    importObject: any,
): Promise<Instance> {
    const { _module } = module;

    const imports = readImports(_module, importObject);

    try {
        const instance = instantiateCoreWasmModule(_module, imports);
        const instanceObject = createInstanceObject(_module, instance);
        return Promise.resolve(instanceObject);
    } catch (error) {
        return Promise.reject(error);
    }
}

// https://webassembly.github.io/spec/js-api/#instantiate-a-webassembly-module
function instantiateWasmModule(module: Module, importObject: any): Instance {
    const { _module } = module;

    const imports = readImports(_module, importObject);
    const instance = instantiateCoreWasmModule(_module, imports);
    return createInstanceObject(_module, instance);
}

// https://webassembly.github.io/spec/js-api/#instantiate-a-promise-of-a-module
function instantiateModulePromise(
    modulePromise: Promise<Module>,
    imports: any,
): Promise<InstantiatedSource> {
    return modulePromise.then(module => {
        const instance = instantiateWasmModule(module, imports);

        return {
            module,
            instance,
        };
    });
}

// https://webassembly.github.io/spec/js-api/#dom-webassembly-instantiate
// https://webassembly.github.io/spec/js-api/#dom-webassembly-instantiate-moduleobject-importobject
function instantiate(module: Module, importObject?: any): Promise<Instance>;
function instantiate(
    bytes: BufferSource,
    importObject?: any,
): Promise<InstantiatedSource>;
function instantiate(
    input: Module | BufferSource,
    importObject?: any,
): Promise<Instance | InstantiatedSource> {
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
    Module,
    Instance,
};
