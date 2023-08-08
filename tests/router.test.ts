import { describe, test, expect } from 'bun:test';
import { extract } from '..';
import { Context, Route } from '../lib/router/router.d';

describe('URL Params', () => {
    test('/user/:name', () => {
        const route: Route = {
            pattern: '/user/:name',
            method: 'GET',
            callback: () => new Response('ok'),
        };

        const ctx: Context = {
            request: new Request('http://localhost:3000/user/foo'),
            params: new Map(),
        };

        const extractor = extract(route, ctx);

        extractor?.params();

        const name = ctx.params.get('name');
        expect(name).toBe('foo');
    });

    test('/user/:name/:id', () => {
        const route: Route = {
            pattern: '/user/:name/:id',
            method: 'GET',
            callback: () => new Response('ok'),
        };

        const ctx: Context = {
            request: new Request('http://localhost:3000/user/foo/123'),
            params: new Map(),
        };

        const extractor = extract(route, ctx);

        extractor?.params();

        const name = ctx.params.get('name');
        const id = ctx.params.get('id');

        expect(name).toBe('foo');
        expect(id).toBe('123');
    });

    test('/foo', () => {
        const route: Route = {
            pattern: '/foo',
            method: 'GET',
            callback: () => new Response('ok'),
        }

        const ctx: Context = {
            request: new Request('http://localhost:3000/foo'),
            params: new Map(),
        }

        const url = new URL(ctx.request.url);

        expect(url.pathname).toBe(route.pattern);
    });
});

describe('Router', () => {
    test('Serve', async () => {
        const proc = Bun.spawn(['./tests/serve.test.sh'], {
            onExit: (_proc, _exitCode, _signalCode , error) => {
                if (error) console.error(error);     
            },
        });
    
        const text = await new Response(proc.stdout).text();
        
        const hasFailed = text.includes('Failed');

        if (hasFailed) console.log(text);

        expect(hasFailed).toBe(false);

        proc.kill(0);
    })

    test('Static', async() => {
        const proc = Bun.spawn(['./tests/static.test.sh']);
        
        const text = await new Response(proc.stdout).text();

        const hasFailed = text.includes('Failed');
        if (hasFailed) console.log(text);

        expect(hasFailed).toBe(false);

        proc.kill(0);
    });
});

