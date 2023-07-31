import { test, describe, expect } from 'bun:test';
import path from 'path';
import { readDir, sum } from './fsys';

describe('File System Routing', () => {
    test('readDir', async () => {
        const expected: string[] = [
            'cache.ts', 'file.ts', 'html.ts', 'params.ts', 
            'post.ts', 'space.ts', 'foobar.html', 'index.html'
        ];

        let got: string[] = [];
        await readDir('./examples', (fp, _) => {
            got.push(path.basename(fp));
        });

        expect(got.sort()).toStrictEqual(expected.sort());
    });
});