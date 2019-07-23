function nonStream() {
    fetch('./examples/add.wasm').then(response => {
        return response.arrayBuffer();
    }).then(buffer => {
        return WebAssembly.instantiate(buffer);
    }).then(result => {
        console.log(result.instance.exports.add(10, 5));
    })
}

function stream() {
    WebAssembly.instantiateStreaming(fetch('./examples/add.wasm')).then(result => {
        console.log(result.instance.exports.add(10, 5));
    })
}

stream();