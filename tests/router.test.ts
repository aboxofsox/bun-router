import { describe, test, expect } from 'bun:test';
import { file, json, extract } from '..';
import { HttpRequest, Route } from '../lib/router/router.d';

describe('Helpers', async () => {
    test('html', async () => {
        const fp = './examples/pages/index.html';
        const res = await file(fp);
        const contentType = res.headers.get('Content-Type');
    
        expect(contentType).toBe('text/html; charset=utf-8');
        expect(res.status).toBe(200);
    });

    test('json', async () => {
        const test = { message: 'ok' }
        const res = await json(test);
        const jsn = await res.json();

        expect(jsn).toStrictEqual({ message: 'ok' })

    });

    test('extract params 1', () => {
        const route: Route = {pattern: '/:name', method: 'GET', callback: (req) => new Response('ok')};
        const httpRequest: HttpRequest = {
            request: new Request('http://localhost:3000/foo'),
            params: new Map(),
            fs : new Map(),
        }

        extract(route, httpRequest)?.params();
        const name = httpRequest.params.get('name');
        expect(name).toBe('foo');
    });

    test('extract params 2', () =>{
        const route: Route = {pattern: '/foo/:name', method: 'GET', callback: (req) => new Response('ok')};
        const httpRequest: HttpRequest = {
            request: new Request('http://localhost:3000/foo/bar'),
            params: new Map(),
            fs: new Map(),
        }

        extract(route, httpRequest)?.params();
        const name = httpRequest.params.get('name');
        expect(name).toBe('bar');
    });
});

describe('Router', () => {
    test('serve', async () => {
        console.log('Testing serve()')
       const proc = Bun.spawn(['./tests/router.test.sh'], {
        onExit(proc, exitCode, signalCode, error) {
            expect(typeof error).toBe('undefined');
        }
       });
       const text = await new Response(proc.stdout).text();

       const hasFailed = text.includes('Failed');
       if (hasFailed) {
        console.log(`Output:\n${text}`);
       }
       expect(hasFailed).toBe(false);
    });
});

describe('File System Params', () => {
    test('extract', () => {
        const req = new Request('http://localhost:3000/foo/bar');
        const httpRequest: HttpRequest = {
            request: req,
            params: new Map(),
            fs: new Map(),
        }
        const route: Route = {
            pattern: '/foo/[name]',
            method: 'GET',
            callback: () => new Response('ok'),
        }

        extract(route, httpRequest)?.fs();

        console.log(httpRequest.fs.size);

        const name = httpRequest.fs.get('name');

        for (const key of httpRequest.fs.keys()) {
            console.log(key);
        }

        
    })
});