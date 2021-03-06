import * as wasm from '../core/main';
import { module_exports } from '../core/main';

import { CompileError } from './errors';
import { compileWasmModule } from './shared';
import { isBufferSource, copyBufferSource, makePropertiesEnumerable } from './utils';

// https://webassembly.github.io/spec/js-api/#enumdef-importexportkind
type ImportExportKind = 'function' | 'table' | 'memory' | 'global';

// https://webassembly.github.io/spec/js-api/#dictdef-moduleexportdescriptor
interface ModuleExportsDescriptor {
    name: string;
    kind: ImportExportKind;
}

// https://webassembly.github.io/spec/js-api/#dictdef-moduleimportdescriptor
interface ModuleImportDescriptor {
    module: string;
    name: string;
    kind: ImportExportKind;
}

// https://webassembly.github.io/spec/js-api/#module
export class Module {
    _module: wasm.Module;
    _bytes: ArrayBuffer;

    // https://webassembly.github.io/spec/js-api/#dom-module-module
    constructor(bytes: BufferSource) {
        if (!isBufferSource(bytes)) {
            throw new TypeError('First argument must be a BufferSource.');
        }

        const stableBytes = copyBufferSource(bytes);
        const { err, res } = compileWasmModule(stableBytes);
        if (err) {
            throw new CompileError(err.message);
        }

        this._module = res!;
        this._bytes = stableBytes;
    }

    get [Symbol.toStringTag]() {
        return "WebAssembly.Module";
    }

    static exports(module: Module): ModuleExportsDescriptor[] {
        return module_exports(module._module).map(([name, kind]) => {
            // TODO: Improve type guard here.
            return {
                name,
                kind,
            } as ModuleExportsDescriptor;
        });
    }

    static imports(module: Module): ModuleImportDescriptor[] {
        return [];
    }

    // https://webassembly.github.io/spec/js-api/#dom-module-customsections
    static customSections(module: Module, sectionName: string): ArrayBuffer[] {
        if (!(module instanceof Module)) {
            throw new TypeError('First argument must be a Module.');
        }
        if (typeof sectionName !== 'string') {
            throw new TypeError('Second argument must be a DOMString.');
        }

        // No need to reparse the module to retrieve the custom section. The module holds a 
        // reference to all the custom sections.
        const moduleInternal = module._module;
        const customSections: ArrayBuffer[] = [];

        for (const custom of moduleInternal.customs) {
            const { name, bytes } = custom;

            if (name === sectionName) {
                const copy = Int8Array.from(bytes).buffer;
                customSections.push(copy);
            }
        }

        return customSections;
    }
}

makePropertiesEnumerable(Module, ['exports', 'imports', 'customSections']);