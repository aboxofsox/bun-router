import { BunFile } from "bun";
import fs from 'node:fs/promises';
import path from 'path';

const isDir = async (fp: string): Promise<boolean> => (await fs.lstat(fp)).isDirectory();

const sum = async (fp: string): Promise<string> => {
    const file = await Bun.file(fp).text();
    const hasher = new Bun.CryptoHasher('md5');

    hasher.update(file);

    return new Promise((resolve, reject) => {
        if (hasher.byteLength === 0) reject('no data');
        const hash = Buffer.from(hasher.digest().toString()).toString('hex');
        return hash;
    });
}

const readDir = async (dirpath: string, handler: (filepath: string, entry: BunFile) => void) => {
    try {
        const files = await fs.readdir(dirpath);

        for (const file of files) {
            const bunFile = Bun.file(file);
            const fp = path.join(dirpath, bunFile.name!);
            const isdir = await isDir(fp);

            if (isdir) await readDir(fp, handler);
            else handler(fp, bunFile);
        }
    } catch (err) {
        console.error(err);
    }
}

export { readDir, sum }