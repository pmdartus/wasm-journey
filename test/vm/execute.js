const assert = require('assert');

const { module_decode, module_instantiate } = require('../../dist/vm/main');
const { readExample } = require('../shared');

describe('execute', () => {
    it('add.wasm', () => {
        const input = readExample('add.wasm');
        
        const module = module_decode(input);
        const instance = module_instantiate(module);
    });
});
