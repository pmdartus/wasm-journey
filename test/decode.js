const fs = require('fs');
const path = require('path');
const assert = require('assert');

const { decode } = require('../dist/decode');

function readExample(name) {
    const buffer = fs.readFileSync(
        path.resolve(__dirname, `./examples/${name}`),
    );

    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);

    for (let i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
    }

    return arrayBuffer;
}

describe('decode', () => {
    it('add.wasm', () => {
        const input = readExample('add.wasm');
        const module = decode(input);
        assert.deepEqual(module, {
            exports: [
                {
                    name: 'add',
                    desc: {
                        type: 0,
                        index: 0,
                    },
                },
            ],
            funcs: [
                {
                    type: 0,
                    index: 0,
                },
            ],
            types: [
                {
                    params: [0, 0],
                    results: [0],
                },
            ],
            codes: [
                {
                    locals: [],
                    body: {
                        instructions: [
                            {
                                type: 'unary',
                                opcode: 32,
                                param: 0,
                            },
                            {
                                type: 'unary',
                                opcode: 32,
                                param: 1,
                            },
                            {
                                type: 'primary',
                                opcode: 106,
                            },
                        ],
                    },
                },
            ],
        });
    });
});
