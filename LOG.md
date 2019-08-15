# 07-21-2019

## Running wasm in the browser

Installed the WebAssembly (`dtsvet.vscode-wasm`) for VSCode. It's pretty neat since it allows to preview the text format out of the binary format directly in VSCode.

It is pretty simple to execute a simple WASM file in the browser. It is possible to create a new instance of a WASM instance from a standard ArrayBuffer.

```js
fetch('./examples/add.wasm').then(res => {
    return res.arrayBuffer();
}).then(buffer => {
    return WebAssembly.instantiate(buffer);
}).then(result => {
    console.log(result.instance.exports.add(10, 5));
})
```

It is also possible to instantiate a new module using streaming. Based on what I have understood so far WASM authors made sure that module can be compiled in a streamed manner. It would be interesting the see if when loading a large WASM file the streaming approach provides an actual performance boost.

```js
WebAssembly.instantiateStreaming(fetch('./examples/add.wasm')).then(result => {
    console.log(result.instance.exports.add(10, 5));
});
```

## Exploring the binary format

In order to better understand the WASM binary format we will introspect the `add.wasm` file using the `xxd` hax dump command line. Set the `-g` option to `1` to separate each byte with a white space.

```
$ xxd -g 1 ./src/playground/examples/add.wasm
00000000: 00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01  .asm.......`....
00000010: 7f 03 02 01 00 07 07 01 03 61 64 64 00 00 0a 09  .........add....
00000020: 01 07 00 20 00 20 01 6a 0b                       ... . .j.
```

```lisp
(module
  (type $t0 (func (param i32 i32) (result i32)))
  (func $add (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    get_local $p0
    get_local $p1
    i32.add)
  (export "add" (func $add)))
```

Let's look at the different part of the binary format. The above binary representation is defined as a [modules](https://webassembly.github.io/spec/core/bikeshed/index.html#modules%E2%91%A0%E2%93%AA) in the specification. Each WASM modules are prefixed with a preamble followed by multiple sections.

### Preamble

<code><pre>
00000000: <mark>00 61 73 6d 01 00 00 00</mark> 01 07 01 60 02 7f 7f 01  .asm.......`....
00000010: 7f 03 02 01 00 07 07 01 03 61 64 64 00 00 0a 09  .........add....
00000020: 01 07 00 20 00 20 01 6a 0b                       ... . .j.
</pre></code>

In order to quickly differentiate WASM module from any other binary, all the WASM module are prefixed with the same [magic number](https://webassembly.github.io/spec/core/bikeshed/index.html#binary-magic): `0x00 0x61 0x73 0x6D`. Right after the magic number, we can find the [version field](https://webassembly.github.io/spec/core/bikeshed/index.html#binary-version): `0x01 0x00 0x00 0x00`. While the WASM binary format has been designed in a way to be forward compatible, the version field allows to introduce breaking change to the format in the future.

### Sections

In a WASM module right after the preamble, we can find the actual meat of the WASM module. The content of a WASM file is divided in multiple [section](https://webassembly.github.io/spec/core/bikeshed/index.html#sections%E2%91%A0). The WASM specification defines multiple type of sections: type section, function section, export section, ... All the section types follows the same format: 

- 1 byte defining the type of the section
- an u32 integer representing the actual content size in byte of the section content
- the actual section content

### Type Sections

<code><pre>
00000000: 00 61 73 6d 01 00 00 00 <mark>01 07 01 60 02 7f 7f 01</mark>  .asm.......`....
00000010: <mark>7f</mark> 03 02 01 00 07 07 01 03 61 64 64 00 00 0a 09  .........add....
00000020: 01 07 00 20 00 20 01 6a 0b                       ... . .j.
</pre></code>

The next section in our WASM module is a [type section](https://webassembly.github.io/spec/core/bikeshed/index.html#binary-typesec). We can see this because the first byte of the section is `0x01`. The second in any section represents the length of the section in byte  encoded in `u32`, `0x07` tells that the section is 7 bytes long.

## References

https://webassembly.github.io/spec/core/bikeshed/index.html - WASM specification
http://ast.run/ - simple playground that shows text format and allow to download the generated binary format
https://github.com/mdn/webassembly-examples/blob/master/understanding-text-format/add.html - simple web assembly examples
https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API - great introduction on how to load and invoke WASM in the browser.
https://blog.mikaellundin.name/2016/06/19/creating-a-webassembly-binary-and-running-it-in-a-browser.html - Explained binary format

# 07-22-2019

> Note: Need to find more details about how the `LEB128` encoding actually works.

It may be that u32 is represented by length using the [LEB128 unsigned](https://webassembly.github.io/spec/core/bikeshed/index.html#integers%E2%91%A4) encoding.

Now that we know that the section is 7 bytes longs, we known that the type section is defined with the following sets of bytes: `0x01 0x60 0x02 0x7f 0x7f 0x01 0x7f`. The specification says defines a type section as following:

* a `typesec` content is defined as `vec(functype)`, 
* a `functype` is defined as `0x60 vec(valtype) vec(valtype)`
* a `vec` is defined as sequence of element prefixed its length encoded in `u32`
* a `valtype` is either an i23 (`0x7f`), i64 (`0x7e`), f32 (`0x7d`) or f64 (`0x7c`)

With this knowledge we can break apart the type section content:
* the `0x01` encodes that there is only one function type defined in the type section
    * the `0x60` is the prefix for a function type
    * the `0x02` encodes that the parameter vector contains 2 items
        * the `0x7f` encodes that the first parameter is of type i32
        * the `0x7f` encodes that the second parameter is of type i32
    * the `0x01` encodes that the return vector only contains one item
        * the `0x7f` encodes that the return value is of type i32

My mental representation of those bytes is the following.

```js
Vec([
    Functype({
        params: Vec([
            Valtype(type: i32),
            Valtype(type: i32),
        ]),
        return: Vec([
            Valtype(type: i32),
        ]),
    })
])
```

### Function section

<code><pre>
00000000: 00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01  .asm.......`....
00000010: 7f <mark>03 02 01 00</mark> 07 07 01 03 61 64 64 00 00 0a 09  .........add....
00000020: 01 07 00 20 00 20 01 6a 0b                       ... . .j.
</pre></code>

Let's go to the next section. As described above each section is prefixed with an id, in this case the prefix is `0x03` mapping to a [function section](https://webassembly.github.io/spec/core/bikeshed/index.html#function-section%E2%91%A0). Again the type section content is 2 bytes long (`0x02`).

As defined in the spec, the function section encodes into a vector the type indices that representing the type field into a function. On the add example the vector contains a single item (`0x01`) which reference the first index in the type section (`0x00`).

### Export section

<code><pre>
00000000: 00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01  .asm.......`....
00000010: 7f 03 02 01 00 <mark>07 07 01 03 61 64 64 00 00</mark> 0a 09  .........add....
00000020: 01 07 00 20 00 20 01 6a 0b                       ... . .j.
</pre></code>

Next section is the add example binary format is an [export section](https://webassembly.github.io/spec/core/bikeshed/index.html#export-section%E2%91%A0) (`0x07`) and is 7 bytes long (`0x07`). The export section defines what gets exposed to the host environment. Each export has a unique name mapping to either a function, a table, a memory or a global.

In our case the add module has a single export (Vec of `0x01` length). Each export is defined as:
* a [`name`](https://webassembly.github.io/spec/core/bikeshed/index.html#binary-name) encoded as vector of characters encoded as UNICODE UTF-8
* followed by [`exportdesc`](https://webassembly.github.io/spec/core/bikeshed/index.html#binary-exportdesc) mapping an export type to its appropriate index (function index, table index, memory index or global index).

The add export encode it's name (`0x03 0x61 0x64 0x64`) as vector of 3 UNICODE characters, and reference a function (`0x00` prefix) mapping to the function at index 0 (`0x00`).

### Code section

<code><pre>
00000000: 00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01  .asm.......`....
00000010: 7f 03 02 01 00 07 07 01 03 61 64 64 00 00 <mark>0a 09</mark>  .........add....
00000020: <mark>01 07 00 20 00 20 01 6a 0b</mark>                       ... . .j.
</pre></code>

We are finally at the end of the module!! This last section implements the actual logic of the module. This section is prefixed with `0x0a` denoting a [code section](https://webassembly.github.io/spec/core/bikeshed/index.html#code-section%E2%91%A0) (code section in the binary format have an id of 10 which is equivalent to `0x0a` in hexadecimal). This section content is 9 bytes long.

A code section is a vector of function defined in the module. In our case the module only contains a single function (`0x01`). As described in the spec each [function](https://webassembly.github.io/spec/core/bikeshed/index.html#binary-code) consist of the function size in byte followed by the actual function code. The only function defined in this module is 7 bytes long (`0x07`).

The actual [function code](https://webassembly.github.io/spec/core/bikeshed/index.html#binary-func) is encoded as a vector of locals followed by an expression. Since no local variable needs to be allocated to add 2 numbers together, the locals vector is empty (`0x00`). Then the expression is defined as a sequence of instruction followed by a sequence termination opcode `0x0b`. If we look back at our example, the actual code of the add function is encoded via `0x20 0x00 0x20 0x01 0x6a`.

The different [instruction](https://webassembly.github.io/spec/core/bikeshed/index.html#instructions%E2%91%A6) are encoded by opcode. A opcode is a single byte representing the actual instruction action. If the opcode accept parameters, the parameters can be find right after the opcode itself. It is easy to understand what each opcode is doing by doing a simple search on the spec.

Are are the different instruction that are encoded in the add function:
* `0x20 0x00`: get a local value at index 0 and push the value to the stack.
* `0x20 0x01`: get a local value at index 1 and push the value to the stack.
* `0x6a`: pop 2 i32 value at the top of the stack and push the result back on the stack.

## First attempt to implement the VM

Focus only the simplest interface `WebAssemble.instantiate`. The WASM spec doesn't contain any information about how WASM get bound to the host environment (aka. embeder). Those bindings are defined in a separate specification: [WebAssembly JavaScript Interface](https://webassembly.github.io/spec/js-api/).

As defined in the specification, the `WebAssemble.instantiate` method is overloaded depending on the passed parameters:
* `Promise<WebAssemblyInstantiatedSource> instantiate(BufferSource bytes, optional object importObject);`
* `Promise<Instance> instantiate(Module moduleObject, optional object importObject);`

For now we will only focus on the `instantiate` method receiving a buffer source. As defined in the WASM specification the instantiation of a WASM module is done in 3 sequential phases: decode, validate and execute. You can find more details about this in the [overview section](https://webassembly.github.io/spec/core/intro/overview.html#semantic-phases) of the specification.

When implementing the initial skeleton for the bindings we can see that the bindings invoke the different phases in the same order. We can also see that the WASM VM exposes a [known set of APIs](https://webassembly.github.io/spec/core/appendix/embedding.html) to the host environment. In the case of the `instantiate` method the we will need to implement the following methods on our VM:
* [`module_decode`](https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-decode): takes a WASM source encoded into the binary format and return a new WASM module.
* [`module_validate`](https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-validate): takes a WASM module and returns a validation error if the module is invalid.
* [`module_instantiate`](https://webassembly.github.io/spec/core/appendix/embedding.html#embed-module-instantiate): takes a WASM module with the external values and returns a new module instance.

## References

https://www.rapidtables.com/convert/number/hex-to-ascii.html - Hex to ASCII text converter
https://webassembly.github.io/spec/js-api - Specification for the Javascript API binding with WebAssembly

# 23-07-2019

The `fs.readFile` and `fs.readFileSync` are both returning both returns a NodeJS [Buffer](https://nodejs.org/api/buffer.html), which is not an actual ArrayBuffer. The `Buffer` was introduced in Node before the standardization of `TypedArray`. In order to convert a Node `Buffer` to an `ArrayBuffer` we will need to use the following snippet of code.

```js
// https://gist.github.com/miguelmota/5b06ae5698877322d0ca
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);

    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }

    return ab;
}
```

> TODO: Need to speak about the ArrayBuffer, Typed Array and Data Views

In order to quickly verify the if the parser works as expected during as I was writing it, I started by creating adding some tests and running both the typescript compiler and the test suite in watch mode. Instead of implementing the entire logic for the parser I decided to focus on implementing only what is necessary for `add.wasm` example.

## References

https://github.com/WebAssembly/spec - WASM specifications + tests
https://stackoverflow.com/a/51511486/3832710 - Node `Buffer` to `ArrayBuffer`

# 14-08-2019

There multiple concepts to understand when it comes to the WASM execution:

* [**Module**](https://webassembly.github.io/spec/core/syntax/modules.html#modules): The WASM program unit, it holds the program logic, defines the interface and contains some initialization logic. A module can be instantiated multiple times. 
* [**Instances**](https://webassembly.github.io/spec/core/exec/runtime.html#module-instances): The runtime representation of a module. This object holds a reference to the actual instances (function instances, tables instances, ...) address in the store.
* [**Store**](https://webassembly.github.io/spec/core/exec/runtime.html#store): The store represents the global state of the WASM program. It holds all the instances of all the modules.

Note: Bindings need to exports all the interfaces, so need to use classes instead of interfaces in typescript to represent the different interfaces.