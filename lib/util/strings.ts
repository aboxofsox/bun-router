const splitPath = (path: string): string[] => path.split('/').filter(Boolean);

export { splitPath }