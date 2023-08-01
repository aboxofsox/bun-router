import { Route, Router, Context, Options } from './router.d';
import { readDir } from '../fs/fsys';
import path from 'path';

const notFound = async (): Promise<Response> => {
    const response = new Response('not found', {
        status: 404,
        statusText: 'not found',
        headers: { 'Content-Type': 'text/html' },
    });

    return new Promise((resolve) => {
        resolve(response);
    });
}

const file = async (filepath: string): Promise<Response> => {
    const file = Bun.file(filepath);
    const exists = await file.exists();

    if (!exists)
        return notFound();

    const content = await file.arrayBuffer();
    if (!content)
        return notFound();

    let contentType = 'text/html; charset=utf-8';

    if (file.type.includes('image')) {
        contentType = file.type + '; charset=utf-8';
    }

    const response = new Response(content, {
        status: 200,
        statusText: 'ok',
        headers: { 'Content-Type': contentType },
    });

    return new Promise<Response>((resolve) => {
        resolve(response);
    });
}

const html = async (content: string): Promise<Response> => {
    const response = new Response(content, {
        status: 200,
        statusText: 'ok',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
    content = Bun.escapeHTML(content);

    return new Promise<Response>((resolve) => {
        resolve(response);
    });
}

const json = (data: any): Response => {
    const jsonString = JSON.stringify(data);

    const res = new Response(jsonString);
    res.headers.set('Content-Type', 'application/json');

    return res
}

const extract = (route: Route, ctx: Context) => {
    const url = new URL(ctx.request.url);
    const pathSegments = route.pattern.split('/');
    const urlSegments = url.pathname.split('/');

    if (pathSegments.length !== urlSegments.length) return


    return {
        params: () => {
            for (let i = 0; i < pathSegments.length; i++) {
                if ((pathSegments[i][0] === ':')) {
                    const k = pathSegments[i].replace(':', '');
                    const v = urlSegments[i];
                    ctx.params.set(k, v);
                }
            }
        }
    }

}

const match = (route: Route, ctx: Context): boolean => {
    return ctx.params.size !== 0 || route.pattern === (new URL(ctx.request.url)).pathname
}

const router: Router = (port?: number | string, options?: Options) => {
    const routes: Array<Route> = new Array();
    const paths: { [key: string]: string } = {};

    return {
        add: (pattern: string, method: string, callback: (ctx: Context) => Response | Promise<Response>) => {
            routes.push({
                pattern: pattern,
                method: method,
                callback: callback,
            })
        },
        static: async (pattern: string, root: string) => {
            await readDir(root, async (fp, _) => {
                const pure = path.join('.', fp);
                const ext = path.extname(pure);

                let base = path.basename(pure);

                if (ext === '.html') {
                    base = base.replace(ext, '');

                }

                if (pattern[0] !== '/') pattern = '/' + pattern;

                let patternPath = pattern + base;

                if (base === 'index') patternPath = pattern;

                const route: Route = {
                    pattern: patternPath,
                    method: 'GET',
                    callback: async () => await file(pure),
                };
                routes.push(route);
            });
        },
        serve: () => {
            console.log(`[bun-router]: Listening on port -> :${port ?? 3000}`)
            Bun.serve({
                port: port ?? 3000,
                ...options,
                fetch(req) {
                    for (const route of routes) {
                        const ctx: Context = {
                            request: req,
                            params: new Map(),
                            fs: new Map(),
                        };

                        const extractor = extract(route, ctx);

                        extractor?.params();

                        if (match(route, ctx))
                            return route.callback(ctx);
                    }
                    return new Response('not found');
                }
            });
        },
    }
}

export { router, json, file, extract, html }