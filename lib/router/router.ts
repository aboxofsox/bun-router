import path from 'path';
import { Database } from 'bun:sqlite';
import { Route, BunRouter, RouterOptions, Options, HttpHandler } from './router.d';
import { httpStatusCodes } from '../http/status';
import { readDir } from '../fs/fsys';
import { Logger, startMessage } from '../logger/logger';
import { http } from '../http/http';
import { RouteTree } from './tree';
import { createContext } from './context';


const Router: BunRouter = (port?: number | string, options?: RouterOptions<Options>) => {
	const { addRoute, findRoute } = RouteTree();
	const logger = Logger();

	return {
		// add a route to the router tree 
		add: (pattern, method, callback) => { addRoute(pattern, method, callback); },
		get: (pattern: string, callback: HttpHandler) => { addRoute(pattern, 'GET', callback); },
		post: (pattern, callback) => { addRoute(pattern, 'POST', callback); },
		put: (pattern, callback) => { addRoute(pattern, 'PUT', callback);},
		delete: (pattern, callback) => { addRoute(pattern, 'DELETE', callback); },
        
		// add a static route to the router tree
		static: async (pattern: string, root: string) => {
			await readDir(root, async (fp) => {
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
			startMessage(port ?? 3000);
			const opts: Options = { db: ':memory:' };

			Bun.serve({
				port: port ?? 3000,
				...options,
				async fetch(req) {
					const url = new URL(req.url);
					const path = url.pathname;

					// set the database
					if (options) {
						const o = options as Options;
						opts.db = o.db;
					}

					const route = findRoute(path);

					// if the route exists, execute the handler
					if (route) {
						if (route.method !== req.method) {
							logger.info(405, url.pathname, req.method, httpStatusCodes[405]);
							return Promise.resolve(http.methodNotAllowed());
						}

						const context = await createContext(path, route, req);
						context.db = new Database(opts.db);

						const response = await route.handler(context);

						logger.info(response.status, url.pathname, req.method, httpStatusCodes[response.status]);
						return Promise.resolve(response);
					} 

					// if no route is found, return 404
					const response = await http.notFound();
                        
					logger.info(response.status, url.pathname, req.method, httpStatusCodes[response.status]);
					return Promise.resolve(http.notFound());

				}
			});
		},
	};
};

export { Router, http };