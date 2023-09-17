import { HttpHandler, Route } from "./router.d";
import { http } from "../http/http";
import { createContext } from './context';

const splitPath = (s: string): string[] => s.split('/').filter(x => x !== '');

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
    let root = createRoute('', 'GET', () => http.notFound());

    const addRoute = (path: string, method: string, handler: HttpHandler) => {
        const pathParts = splitPath(path);
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
        current.path = path;
    };

    const findRoute = (path: string): Route | undefined => {
        const pathParts = splitPath(path);
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

    return { addRoute, findRoute }

};

export { RouteTree, createContext }