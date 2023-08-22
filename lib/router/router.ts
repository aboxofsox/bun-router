import path from 'path';
import { Database } from 'bun:sqlite';
import { Route, Router, Context, RouterOptions, Options } from './router.d';
import { httpStatusCodes } from '../http/status';
import { readDir } from '../fs/fsys';
import { logger } from '../logger/logger';
import { Logger } from '../logger/logger.d';
import { http } from '../http/generic-methods';

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

// set the context for the reuest
const setContext = (req: Request, lgr: Logger, opts: Options, route: Route): Context => {
    return {
        formData: req.formData(),
        request: req,
        params: new Map(),
        query: new URL(req.url).searchParams,
        db: new Database(opts.db ?? ':memory:'),
        logger: lgr,
        route: route,
        json: (data: any) => http.json(data),
    }
}

const router: Router = (port?: number | string, options?: RouterOptions<Options>) => {
    const routes: Array<Route> = new Array();
    const lgr = logger();

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
                    callback: async () => await http.file(pure),
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

                    let statusCode = 404;

                    for (const route of routes) {
                        const ctx = setContext(req, lgr, opts, route);

                        if (match(route, ctx) || route.pattern === url.pathname) {
                            if (route.method === ctx.request.method) {
                                const res = await route.callback(ctx);
                                statusCode = res.status;
                                lgr.info(res.status, route.pattern, req.method, httpStatusCodes[res.status]);
                                return Promise.resolve(res);
                            } else {
                                const res = new Response(httpStatusCodes[405], {
                                    status: 405,
                                    statusText: httpStatusCodes[305]
                                });
                                lgr.info(405, route.pattern, req.method, httpStatusCodes[405])
                                return Promise.resolve(res);
                            }
                        }  
                    }

                    lgr.info(statusCode, url.pathname, req.method, httpStatusCodes[statusCode]);
                    return Promise.resolve(http.message(statusCode, httpStatusCodes[statusCode]));
                }
            });
        },
    }
}


export { router, extract, http }