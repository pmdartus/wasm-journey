import { makePropertiesEnumerable } from './utils';

interface MemoryDescriptor {
    initial: number;
    maximum?: number;
}

export class Memory {
    _buffer: ArrayBuffer;

    // https://webassembly.github.io/spec/js-api/#dom-memory-memory
    constructor(descriptor: MemoryDescriptor) {
        const { initial, maximum } = descriptor;
    
        if (typeof initial !== 'number') {
            throw new TypeError('First argument must be a number.');
        }
        if (initial !== undefined && typeof initial !== 'number') {
            throw new TypeError('Second argument must be undefined or a number');
        }
    
        if (maximum !== undefined && maximum < initial) {
            throw new RangeError('Maximum should be greater than initial.');
        }

        this._buffer = new ArrayBuffer(0);
    }

    // https://webassembly.github.io/spec/js-api/#dom-memory-grow
    grow(delta: number): number {
        return 0;
    }

    // https://webassembly.github.io/spec/js-api/#dom-memory-buffer
    get buffer(): ArrayBuffer {
        return this._buffer;
    }
}

makePropertiesEnumerable(Memory.prototype, ['grow', 'buffer']);