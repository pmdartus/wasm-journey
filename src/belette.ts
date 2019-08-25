import WebAssemblyObject from './js-api/main';

/** 
 * Patch the global object WebAssembly namespace with the package implementation.
 */
export function patchGlobal() {
    Object.defineProperty(globalThis, 'WebAssembly', {
        value: WebAssemblyObject,
        configurable: true,
        writable: true,
    });
}

export * from './js-api/main';



