import { makePropertiesEnumerable } from './utils';

type TableKind = 'anyfunc';

interface TableDescriptor {
    element: TableKind;
    initial: number;
    maximum: number;
}

// https://webassembly.github.io/spec/js-api/#table
export class Table {
    // https://webassembly.github.io/spec/js-api/#dom-table-table
    constructor(descriptor: TableDescriptor) {}

    // https://webassembly.github.io/spec/js-api/#dom-table-grow
    grow(delta: number): number {
        return 0;
    }

    // https://webassembly.github.io/spec/js-api/#dom-table-get
    get(index: number): Function {
        return () => {};
    }

    // https://webassembly.github.io/spec/js-api/#dom-table-set
    set(index: number, value: Function): void {}

    // https://webassembly.github.io/spec/js-api/#dom-table-length
    get length(): number {
        return 0;
    }

    get [Symbol.toStringTag]() {
        return "WebAssembly.Table";
    }
}

makePropertiesEnumerable(Table.prototype, ['grow', 'get', 'set', 'length']);
