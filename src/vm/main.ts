export * from './structure';

export { decode as module_decode } from './decode';
export { validate as module_validate } from './validate';
export { instantiateModule as module_instantiate, Store, ModuleInstance } from './execute';

export { module_exports, store_init } from './embedding';