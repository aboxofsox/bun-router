import { describe, test, expect } from 'bun:test';
import { file, json, extractParams } from '..';
import { HttpRequest, Route } from '../lib/router/router.d';

describe('Helpers', async () => {
    test('html', async () => {
        const fp = './examples/pages/index.html';
        const res = await file(fp);
        const contentType = res.headers.get('Content-Type');
    
        expect(contentType).toBe('text/html');
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
        }

        extractParams(route, httpRequest);
        const name = httpRequest.params.get('name');
        expect(name).toBe('foo');
    });

    test('extract params 2', () =>{
        const route: Route = {pattern: '/foo/:name', method: 'GET', callback: (req) => new Response('ok')};
        const httpRequest: HttpRequest = {
            request: new Request('http://localhost:3000/foo/bar'),
            params: new Map(),
        }

        extractParams(route, httpRequest);
        const name = httpRequest.params.get('name');
        expect(name).toBe('bar');
    });
});