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

// resolve module paths relative to the current working directory
function resolveModulePath(module: string) {
	return path.join(process.cwd(), module);
}

function exists(filepath: string): boolean {
	try {
		fs.access(filepath);
		return true;
	} catch (err) {
		return false;
	}
}

export { readDir, resolveModulePath, exists };