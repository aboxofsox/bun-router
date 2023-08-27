import path from 'path';
import { Database } from 'bun:sqlite';
import { Route, Router, Context, RouterOptions, Options, HttpHandler } from './router.d';
import { httpStatusCodes } from '../http/status';
import { readDir } from '../fs/fsys';
import { logger } from '../logger/logger';
import { Logger } from '../logger/logger.d';
import { http } from '../http/generic-methods';
import {Radix, createContext} from './tree';

const extract = (path: string, ctx: Context) => {
    const url = new URL(ctx.request.url);
    const pathSegments = path.split('/');
    const urlSegments = url.pathname.split('/');

    if (pathSegments.length !== urlSegments.length) return

    return {
        params: () => {
            for (let i = 0; i < pathSegments.length; i++) {
                if((pathSegments[i][0] === ':')) {
                    const k = pathSegments[i].replace(':', '');
                    const v = urlSegments[i];
                    ctx.params.set(k,v);
                }
            }
        }
    }

}

const router: Router = (port?: number | string, options?: RouterOptions<Options>) => {
    const routes = Radix();
    const lgr = logger();

    return {
        // add a new route
        add: (pattern: string, method: string, callback: HttpHandler) => {
            routes.addRoute(pattern, callback);
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
                    handler: async () => await http.file(200, pure),
                };

                routes.addRoute(route.pattern, route.handler);
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

                    let path = url.pathname;

                    const route = routes.findRoute(path);

                    if (route) {
                        const context = createContext(path, route, req);
                        const response = await route.handler(context);

                        lgr.info(response.status, url.pathname, req.method, httpStatusCodes[response.status]);
                        return Promise.resolve(response);
                    }


                    lgr.info(statusCode, url.pathname, req.method, httpStatusCodes[statusCode]);
                    return Promise.resolve(http.message(statusCode, httpStatusCodes[statusCode]));
                }
            });
        },
    }
}


export { router, extract, http }