import { makePropertiesEnumerable } from './utils';
import { getSurroundingAgentStore, setSurroundingAgentStore } from './shared';

interface MemoryDescriptor {
    initial: number;
    maximum?: number;
}

const UNSIGNED_LONG_MAX_VALUE = 0xffffffff;

function isUnsignedLong(value: any): value is number {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= UNSIGNED_LONG_MAX_VALUE
    );
}

export class Memory {
    _address: number;
    _buffer: ArrayBuffer;

    // https://webassembly.github.io/spec/js-api/#dom-memory-memory
    constructor(descriptor: MemoryDescriptor) {
        const { initial, maximum } = descriptor;

        if (!isUnsignedLong(initial)) {
            throw new TypeError('initial must be a number.');
        }
        if (maximum !== undefined && !isUnsignedLong(maximum)) {
            throw new TypeError('maximum must be undefined or a number');
        }

        if (maximum !== undefined && maximum < initial) {
            throw new RangeError('Maximum should be greater than initial.');
        }

        const store = getSurroundingAgentStore();
        // TODO
        setSurroundingAgentStore(store);

        this._buffer = new ArrayBuffer(0);
        this._address = 0;
    }

    // https://webassembly.github.io/spec/js-api/#dom-memory-grow
    grow(delta: number): number {
        return 0;
    }

    // https://webassembly.github.io/spec/js-api/#dom-memory-buffer
    get buffer(): ArrayBuffer {
        return this._buffer;
    }

    get [Symbol.toStringTag]() {
        return 'WebAssembly.Memory';
    }
}

makePropertiesEnumerable(Memory.prototype, ['grow', 'buffer']);
