import { Module } from './modules';
import { instantiateWasmModule } from './shared';
import { makePropertiesEnumerable } from './utils';

// https://webassembly.github.io/spec/js-api/#dom-instance-instance
export class Instance {
    _exports: any;

    constructor(module: Module, importObject: any) {
        return instantiateWasmModule(module, importObject);
    }

    get exports() {
        return this._exports;
    }

    get [Symbol.toStringTag]() {
        return "WebAssembly.Instance";
    }
}

makePropertiesEnumerable(Instance.prototype, ['exports']);