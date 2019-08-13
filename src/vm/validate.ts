import { FunctionType, Module, ValueType, Export, Function } from './structure';

// https://webassembly.github.io/spec/core/valid/conventions.html#context
interface Context {
    locals: ValueType[];
    return?: ValueType;
}

// https://webassembly.github.io/spec/core/valid/types.html#valid-functype
function validateFunctionType(functionType: FunctionType) {
    if (functionType.results.length > 1) {
        throw TypeError("Invalid function type, can't have multiple return");
    }
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-module
function validateFunction(fn: Function) {
    // TODO
}

// https://webassembly.github.io/spec/core/valid/modules.html#exports
function validateExport(exportedValue: Export) {
    const exportedDescType = exportedValue.descriptor.type;
    if (
        exportedDescType !== 'function' &&
        exportedDescType !== 'table' &&
        exportedDescType !== 'memory' &&
        exportedDescType !== 'global'
    ) {
        throw new TypeError(`Invalid export type ${exportedDescType}`);
    }
}

// https://webassembly.github.io/spec/core/valid/modules.html#valid-module
export function validate(module: Module) {
    const { exports } = module;

    const context: Context = {
        locals: [],
    };

    for (const functionType of module.types) {
        validateFunctionType(functionType);
    }

    for (const fn of module.functions) {
        validateFunction(fn);
    }

    for (const exportedValue of exports) {
        validateExport(exportedValue);
    }

    const exportLength = exports.length;
    for (let i = 0; i < exportLength; i++) {
        for (let j = i + 1; j < exportLength; j++) {
            if (exports[i].name === exports[j].name) {
                throw new TypeError(
                    `Invalid export, duplicate ${exports[j].name} export`,
                );
            }
        }
    }
}
