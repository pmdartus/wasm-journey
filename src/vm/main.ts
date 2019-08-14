export * from './structure';

export { decode as module_decode } from './decode';
export { validate as module_validate } from './validate';
export { instantiateModule as module_instantiate, Store, ModuleInstance, Value } from './execute';

export { module_exports, store_init, instance_export, func_type, func_invoke } from './embedding';