import path from 'path';
import { Database } from 'bun:sqlite';
import { Route, BunRouter, RouterOptions, Options, HttpHandler } from './router.d';
import { httpStatusCodes } from '../http/status';
import { readDir } from '../fs/fsys';
import { Logger, startMessage } from '../logger/logger';
import { http } from '../http/http';
import { RouteTree } from './routeTree';
import { createContext } from './context';

const Router: BunRouter = (port?: number | string, options?: RouterOptions<Options>) => {
	const { addRoute, findRoute, list } = RouteTree();
	const logger = Logger();

	async function loadComponent(root: string, name: string) {
		const module = await import(path.join(process.cwd(), root, name));
		return module.default;
	}

	function extractPathExtBase(pattern: string, pathname: string) {
		const extension = path.extname(pathname);
		let base = encodeURIComponent(path.basename(pathname));

		if (extension === '.html' || extension === '.tsx') base = base.replace(extension, '');

		let patternPath = [pattern, base].join('/');

		if (base === 'index') patternPath = pattern;
		
		return { patternPath, extension, base };
	}

	async function exists(fp: string) {
		const f = Bun.file(fp);
		return await f.exists();
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
			if (!exists(root)) return console.error(`Directory not found: ${root}`);
			await readDir(root, async (fp) => {
				const { patternPath, extension, base } = extractPathExtBase(pattern, fp);

				const route: Route = {
					children: new Map(),
					dynamicPath: '',
					isLast: true,
					path: patternPath.startsWith('//') ? patternPath.slice(1) : patternPath, // remove the leading '/' if it exists
					method: 'GET',
					handler: async () => {
						if (extension === '.tsx') {
							const component = await loadComponent(root, base);
							return await http.render(component());
						} else {
							return await http.file(200, fp);
						}
					},
				};

				addRoute(route.path, 'GET', route.handler);
			});

			console.log(list());
			
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
				},
				error(error) {
					return new Response(`<pre>${error}\n${error.stack}</pre>`, {
						headers: { 'Content-Type': 'text/html' },
					});
				}
			});
		},
	};
};

export { Router, http };