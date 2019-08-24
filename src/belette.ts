import * as WebAssembly from './js-api/main';

/** 
 * Patch the global object WebAssembly namespace with the package implementation.
 */
export function patchGlobal() {
    globalThis.WebAssembly = WebAssembly as any;
}

export * from './js-api/main';



