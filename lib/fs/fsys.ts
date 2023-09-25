import { BunFile } from 'bun';
import fs from 'node:fs/promises';
import path from 'path';

// check if the file path is a directory
const isDir = async (fp: string): Promise<boolean> => (await fs.lstat(fp)).isDirectory();

// recursively read a directory and call a handler function on each file
async function readDir(dirpath: string, handler: (filepath: string, entry: BunFile) => void) {
	const files = await fs.readdir(dirpath);

	for (const file of files) {
		const bunFile = Bun.file(file);

		if (typeof bunFile.name === 'undefined') return;

		const fp = path.join(dirpath, bunFile.name);
		const isdir = await isDir(fp);

		if (isdir) await readDir(fp, handler);
		else handler(fp, bunFile);
	}
}

// get the extension of a file (unnecessary)
function ext(p: string): string {
	return path.extname(p);
}

// split a file path into an array of strings (unnecessary)
function splitFilePath(p: string): string[] {
	return p.split(path.sep);
}

function resolveModulePath(module: string) {
	return path.join(process.cwd(), module);
}


export { readDir, ext, splitFilePath, resolveModulePath };