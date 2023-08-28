import path from 'path';
import { Database } from 'bun:sqlite';
import { Route, Router, Context, RouterOptions, Options, HttpHandler } from './router.d';
import { httpStatusCodes } from '../http/status';
import { readDir } from '../fs/fsys';
import { logger } from '../logger/logger';
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
    const {addRoute, findRoute} = Radix();
    const lgr = logger();

    return {
        // add a route to the router tree 
        add: (pattern: string, method: string, callback: HttpHandler) => {
            addRoute(pattern, method, callback);
        },
        // add a static route to the router tree
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
                    children: new Map(),
                    dynamicPath: '',
                    isLast: true,
                    path: patternPath,
                    method: 'GET',
                    handler: async () => await http.file(200, pure),
                };

                addRoute(route.path, 'GET', route.handler);
            });
        },
        // start the server
        serve: () => {
            lgr.start(port ?? 3000);
            let opts: Options = { db: ':memory:' };

            // TODO: add support for TLS and WebSockets
            Bun.serve({
                port: port ?? 3000,
                ...options,
                async fetch(req) {
                    const url = new URL(req.url);
                    let path = url.pathname;

                    // set the database
                    if (options) {
                        let o = options as Options;
                        opts.db = o.db;
                    }

                    const route = findRoute(path);

                    // if the route exists, execute the handler
                    if (route) {
                        if (route.method !== req.method) {
                            lgr.info(405, url.pathname, req.method, httpStatusCodes[405]);
                            return Promise.resolve(http.methodNotAllowed());
                        }

                        const context = createContext(path, route, req);
                        context.db = new Database(opts.db);

                        const response = await route.handler(context);

                        lgr.info(response.status, url.pathname, req.method, httpStatusCodes[response.status]);
                        return Promise.resolve(response);
                    } 

                    // if no route is found, return 404
                    const response = await http.notFound();
                        
                    lgr.info(response.status, url.pathname, req.method, httpStatusCodes[response.status]);
                    return Promise.resolve(http.notFound());

                }
            });
        },
    }
}


export { router, extract, http }