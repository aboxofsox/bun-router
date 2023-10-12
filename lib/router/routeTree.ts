import { HttpHandler, Route } from './router.d';
import { http } from '../http/http';
import { createContext } from './context';

const createRoute = (path: string, method: string, handler: HttpHandler): Route => {
	const route: Route = {
		children: new Map(),
		path: path,
		dynamicPath: '',
		method: method,
		handler: handler,
		isLast: false
	};

	return route;
};

const RouteTree = () => {
	const root = createRoute('', 'GET', () => http.notFound());

	function addRoute (pattern: string, method: string, handler: HttpHandler){
		console.log(pattern);
		const pathParts = pattern.split('/');
		let current = root;

		for (let i = 0; i < pathParts.length; i++) {
			const part = pathParts[i];
			if (part.startsWith(':')) {
				current.dynamicPath = part;
			}
			if (!current.children.has(part)) {
				current.children.set(part, createRoute(part, method, handler));
			}
			current = current.children.get(part)!;
		}

		current.handler = handler;
		current.isLast = true;
		current.path = pattern;
	}

	function findRoute(pathname: string): Route | undefined {
		const pathParts = pathname.split('/');
		let current = root;
		for (let i = 0; i < pathParts.length; i++) {
			const part = pathParts[i];
			if (current.children.has(part)) {
				current = current.children.get(part)!;
			} else if (current.dynamicPath) {
				current = current.children.get(current.dynamicPath)!;
			} else {
				return;
			}
		}
		return current;
	}

	function size() {
		let count = 0;
		function traverse(route: Route) {
			count++;
			for (const child of route.children.values()) {
				traverse(child);
			}
		}
		traverse(root);
		return count;
	}

	function list() {
		const routes: Route[] = [];
		function traverse(route: Route) {
			routes.push(route);
			for (const child of route.children.values()) {
				traverse(child);
			}
		}
		traverse(root);
		return routes;
	}

	return { addRoute, findRoute, size, list };

};

export { RouteTree, createContext };