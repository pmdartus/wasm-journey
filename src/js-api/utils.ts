function isArrayBufferView(obj: any): obj is ArrayBufferView {
    return (
        obj instanceof Int8Array ||
        obj instanceof Int16Array ||
        obj instanceof Int32Array ||
        obj instanceof Uint8Array ||
        obj instanceof Uint16Array ||
        obj instanceof Uint32Array ||
        obj instanceof Uint8ClampedArray ||
        obj instanceof Float32Array ||
        obj instanceof Float64Array ||
        obj instanceof DataView
    )
}

export function isBufferSource(obj: any): obj is BufferSource {
    return (
        obj instanceof ArrayBuffer ||
        isArrayBufferView(obj)
    );
}

export function copyBufferSource(bufferSource: BufferSource): ArrayBuffer {
    return bufferSource instanceof ArrayBuffer
        ? bufferSource.slice(0)
        : bufferSource.buffer.slice(0);
}

export function makePropertiesEnumerable(object: any, properties: string[]): void {
    for (const property of properties) {
        const descriptor = Object.getOwnPropertyDescriptor(object, property);
        Object.defineProperty(object, property, {
            ...descriptor,
            enumerable: true,
        });
    }
}