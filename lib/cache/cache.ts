import { readDir } from "../fs/fsys.ts";
import { Cache } from './cache.d';

const cache = (): Cache => {
    const store: Map<string, ArrayBuffer> = new Map();

    return {
        preload: function(filepath: string) {
            readDir(filepath, async (p, _file) => {
                const file = await Bun.file(p).arrayBuffer();
                store.set(p, file);
            });
        },
        set: function(key: string, value: ArrayBuffer) {
            store.set(key, value);
        },
        get: function(key: string){
            const v = store.get(key);
            if (typeof v === 'undefined') return null
            return v
        },
        remove: function(key: string) {
            const v = store.get(key);
            if (typeof v === 'undefined') return;
            store.delete(key);
        },
        size: async function() {
            return Promise.resolve(store.size);
        }
    }
}

export { cache }