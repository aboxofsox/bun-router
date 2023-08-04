type Cache = {
    preload: function(string): void,
    set: function(string, ArrayBuffer): void,
    get: function(string, ArrayBuffer): ArrayBuffer | null,
    remove: function(string): void,
    size: function(): Promise<number>,
}

export { Cache }