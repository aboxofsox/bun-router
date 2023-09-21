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

	async function loadComponent(name: string) {
		const module = await import(name);
		return module.default;
	}

	return {
		// add a route to the router tree 
		add: (pattern, method, callback) => { addRoute(pattern, method, callback); },
		get: (pattern: string, callback: HttpHandler) => { addRoute(pattern, 'GET', callback); },
		post: (pattern, callback) => { addRoute(pattern, 'POST', callback); },
		put: (pattern, callback) => { addRoute(pattern, 'PUT', callback);},
		delete: (pattern, callback) => { addRoute(pattern, 'DELETE', callback); },
        
		// add static routes to the router tree
		// .tsx and .html are rendered as components
		// all other file extensions are served as files
		// the root directory is traversed recursively
		static: async (pattern: string, root: string) => {
			await readDir(root, async (fp) => {
				const pure = path.join('.', fp);
				const ext = path.extname(pure);

				let base = path.basename(pure);

				//FIXME: this can be improved
				if (ext === '.html') base = base.replace(ext, '');
				if (ext === '.tsx') base = base.replace(ext, '');

				if (pattern[0] !== '/') pattern = '/' + pattern;

				let patternPath = pattern + base;

				if (base === 'index') patternPath = pattern;

				const route: Route = {
					children: new Map(),
					dynamicPath: '',
					isLast: true,
					path: patternPath,
					method: 'GET',
					handler: async () => {
						if (ext === '.tsx') {
							const component = await loadComponent(path.join(root, patternPath));
							return await http.render(component());
						} else {
							return await http.file(200, pure);
						}
					},
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