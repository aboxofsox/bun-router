import path from 'path';
import { Database } from 'bun:sqlite';
import { Route, BunRouter, RouterOptions, Options, HttpHandler } from './router.d';
import { httpStatusCodes } from '../http/status';
import { readDir, exists } from '../fs/fsys';
import { Logger, startMessage } from '../logger/logger';
import { http } from '../http/http';
import { RouteTree } from './routeTree';
import { createContext } from './context';

const Router: BunRouter = (port?: number | string, options?: RouterOptions<Options>) => {
	const { addRoute, findRoute } = RouteTree();
	const logger = Logger();

	async function loadComponent(name: string) {
		const modulePath = path.join(process.cwd(), name);
		const module = await import(modulePath);
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
		// .tsx and .html are rendered as components, or pages
		// all other file extensions are served as files
		// the root directory is traversed recursively
		static: async (pattern: string, root: string) => {
			if (!exists(root)) console.log(`Cannot find directory ${root}`);
			await readDir(root, async (fp) => {
				const ext = path.extname(fp);

				let base = path.basename(fp);

				if (ext === '.html' || ext === '.tsx') base = base.replace(ext, '');

				if (pattern[0] !== '/') pattern = '/' + pattern;

				let patternPath = pattern + '/' + base;

				if (base === 'index') patternPath = pattern;

				const purePath = path.join(root, patternPath);

				const route: Route = {
					children: new Map(),
					dynamicPath: '',
					isLast: true,
					path: patternPath.slice(1),
					method: 'GET',
					handler: async () => {
						if (ext === '.tsx') {
							const component = await loadComponent(purePath.split('.')[0]);
							return await http.render(component());
						} else {
							return await http.file(200, fp);
						}
					},
				};

				console.log(route.path);

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
					const pathname = url.pathname;

					// set the database
					if (options) {
						const o = options as Options;
						opts.db = o.db;
					}

					const route = findRoute(pathname);

					// if the route exists, call the handler
					if (route) {
						if (route.method !== req.method) {
							logger.info(405, url.pathname, req.method, httpStatusCodes[405]);
							return Promise.resolve(http.methodNotAllowed());
						}

						const context = await createContext(pathname, route, req);
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