import { BunFile } from "bun";
import fs from 'node:fs/promises';
import path from 'path';

const isDir = async (fp: string): Promise<boolean> => (await fs.lstat(fp)).isDirectory();

const readDir = async (dirpath: string, handler: (filepath: string, entry: BunFile) => void) => {
        const files = await fs.readdir(dirpath);

        for (const file of files) {
            const bunFile = Bun.file(file);
            if (typeof bunFile.name === 'undefined') return
            const fp = path.join(dirpath, bunFile.name);
            const isdir = await isDir(fp);

            if (isdir) await readDir(fp, handler);
            else handler(fp, bunFile);
        }

}

export { readDir }