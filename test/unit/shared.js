const fs = require('fs');
const path = require('path');

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

module.exports = {
    readExample,
}