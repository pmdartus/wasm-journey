
// https://webassembly.github.io/spec/js-api/#compileerror
export class CompileError extends Error {
    get name() {
        return 'CompilerError';
    }
}

// https://webassembly.github.io/spec/js-api/#linkerror
export class LinkError extends Error {
    get name() {
        return 'LinkError';
    }
}

// https://webassembly.github.io/spec/js-api/#runtimeerror
export class RuntimeError extends Error {
    get name() {
        return 'RuntimeError';
    }
}