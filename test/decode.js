const fs = require('fs');
const path = require('path');

const { decode } = require('../dist/decode');

function readExample(name) {
    const buffer = fs.readFileSync(path.resolve(__dirname, `./examples/${name}`));
    
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
        console.log(JSON.stringify(module, null, 4))
    });
});
