import { Database } from 'bun:sqlite';
import { Route, Router, Context, RouterOptions, Options } from './router.d';
import { httpStatusCodes } from '../http/status';
import { readDir } from '../fs/fsys';
import { logger } from '../logger/logger';
import path from 'path';

// create a generic HTTP response
const httpMessage = async (status: number, msg?: string): Promise<Response> => {
    const response = new Response(msg ?? '?', {
        status: status,
        statusText: msg ?? '?',
        headers: { 'Content-Type': 'text/html; charset-uft-8' }
    });
    return new Promise((resolve) => {
        resolve(response);
    });
};

// a generic 'not found' HTTP response
const notFound = async (msg?: string): Promise<Response> => {
    const response = new Response(msg ?? 'not found', {
        status: 404,
        statusText: 'not found',
        headers: { 'Content-Type': 'text/html' },
    });

    return new Promise((resolve) => {
        resolve(response);
    });
}

// a generic 'no content' HTTP response
const noContent = async (): Promise<Response> => {
    const response = new Response('no content', {
        status: 204,
        statusText: 'no content',
    });

    return new Promise((resolve) => {
        resolve(response);
    });
}

// IO handling
const file = async (filepath: string): Promise<Response> => {
    const file = Bun.file(filepath);
    const exists = await file.exists();

    // check if the file exists, return 'not found' if it doesn't.
    if (!exists)
        return notFound(`File not found: ${filepath}`);

    // get the content of the file as an ArrayBuffer
    const content = await file.arrayBuffer();
    if (!content)
        return noContent();

    // default Content-Type + encoding
    let contentType = 'text/html; charset=utf-8';

    // change the Content-Type if the file type is an image.
    // file.type provides the necessary Content-Type
    if (file.type.includes('image')) {
        contentType = file.type + '; charset=utf-8';
    }

    // create a new response with the necessary criteria
    const response = new Response(content, {
        status: 200,
        statusText: 'ok',
        headers: { 'Content-Type': contentType },
    });

    return Promise.resolve(response);
}

// handle strings as HTML
const html = async (content: string): Promise<Response> => {
    const response = new Response(content, {
        status: 200,
        statusText: 'ok',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    // escape the HTML
    content = Bun.escapeHTML(content);

    return Promise.resolve(response);
}

// create a JSON response
const json = (data: any): Response => {
    const jsonString = JSON.stringify(data);

    const res = new Response(jsonString);
    res.headers.set('Content-Type', 'application/json');

    return res
}

// extract dynamic URL parameters
// if the route pattern is /:foo and the request URL is /bar: {foo: 'bar'}
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

// ensure the route pattern matches the request URL
const match = (route: Route, ctx: Context): boolean => {
    const url = new URL(ctx.request.url);
    const patternRegex = new RegExp('^' + route.pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
    const matches = url.pathname.match(patternRegex);

    if (matches && route.method === ctx.request.method) {
        const extractor = extract(route, ctx);
        extractor?.params();

        return true;
    }

    return false;
}



const router: Router = (port?: number | string, options?: RouterOptions<Options>) => {
    const routes: Array<Route> = new Array();
    const lgr = logger();
    let dbConn = '';

    return {
        // add a new route
        add: (pattern: string, method: string, callback: (ctx: Context) => Response | Promise<Response>) => {
            routes.push({
                pattern: pattern,
                method: method,
                callback: callback,
            })
        },
        GET: (pattern: string, callback: (ctx: Context) => Response | Promise<Response>) => {
            routes.push({
                pattern: pattern,
                method: 'GET',
                callback: callback,
            });
        },
        POST: (pattern: string, callback: (ctx: Context) => Response | Promise<Response>) => {
            routes.push({
                pattern: pattern,
                method: 'POST',
                callback: callback,
            });
        },
        // add a route for static files
        static: async (pattern: string, root: string) => {
            await readDir(root, async (fp, _) => {
                const pure = path.join('.', fp);
                const ext = path.extname(pure);

                let base = path.basename(pure);

                if (ext === '.html') base = base.replace(ext, '');

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
        // start the server
        serve: () => {
            lgr.start(port ?? 3000);
            let opts: Options = { db: ':memory:' };

            Bun.serve({
                port: port ?? 3000,
                ...options,
                async fetch(req) {
                    const url = new URL(req.url);

                    if (options) {
                        let o = options as Options;
                        opts.db = o.db;
                    }

                    let statusCode = 404; // Default status code for route not found

                    for (const route of routes) {
                        const ctx: Context = {
                            request: req,
                            params: new Map(),
                            db: new Database(opts.db ?? ':memory:'),
                            logger: lgr,
                        };

                        if (url.pathname === '/favicon.ico') {
                            return noContent();
                        }

                        if (route.method !== req.method) {
                            statusCode = 405;
                            continue;
                        }

                        if (match(route, ctx)) {
                            const res = await route.callback(ctx);
                            if (res) {
                                statusCode = 200;
                                lgr.info(statusCode, url.pathname, req.method, httpStatusCodes[statusCode]);
                                return res
                            } else {
                                statusCode = 500;
                                break;
                            }
                        }
                    }

                    if (statusCode === 405) {
                        lgr.info(statusCode, url.pathname, req.method, httpStatusCodes[statusCode]);
                        return httpMessage(statusCode, httpStatusCodes[statusCode]);
                    }

                    // Handle route not found (404)
                    lgr.info(statusCode, url.pathname, req.method, httpStatusCodes[statusCode]);
                    return httpMessage(statusCode, httpStatusCodes[statusCode]);

                }
            });
        },
    }
}


export { router, json, file, extract, html }