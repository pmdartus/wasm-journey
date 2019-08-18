const assert = require('assert');

const { default: WebAssembly } = require('../../dist/bindings');
const { readExample } = require('./shared');

const addBytes = readExample('./add.wasm');

describe('bindings', () => {
    describe('validate', () => {
        it('returns true for valid binary', () => {
            const isValid = WebAssembly.validate(addBytes);
            assert.strictEqual(isValid, true);
        });

        it('returns false for invalid binary', () => {
            const invalidBytes = new ArrayBuffer(0);
            const isValid = WebAssembly.validate(invalidBytes);
            assert.strictEqual(isValid, false);
        });
    });

    describe('compile', () => {
        it('returns a promise of a Module', async () => {
            const module = await WebAssembly.compile(addBytes);
            assert(module instanceof WebAssembly.Module);
        });
    });

    describe('instantiate', () => {
        it('accepts bytes and returns an instantiated source', async () => {
            const instantiatedSource = await WebAssembly.instantiate(addBytes);
            assert(instantiatedSource.instance instanceof WebAssembly.Instance);
            assert(instantiatedSource.module instanceof WebAssembly.Module);
        });

        it('accepts a module and returns an instance', async () => {
            const module = await WebAssembly.compile(addBytes);
            const instance = await WebAssembly.instantiate(module);
            assert(instance instanceof WebAssembly.Instance);
        });

        it('contains the exported function', async () => {
            const module = await WebAssembly.compile(addBytes);
            const instance = await WebAssembly.instantiate(module);

            assert(instance.exports.add instanceof Function);
            assert.strictEqual(instance.exports.add.length, 2);
            assert.strictEqual(instance.exports.add(1, 2), 3);
        });
    });
});