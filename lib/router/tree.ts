import { HttpHandler, Context } from "./router.d";
import { http } from "../http/generic-methods";


type Route = {
    children: Map<string, Route>;
    path: string;
    dynamicPath: string;
    handler: HttpHandler;
    isLast: boolean;
}

const splitPath = (s: string) => s.split('/').filter(x => x !== '');

const createRoute = (path: string, handler: HttpHandler): Route => {
    const route: Route = {
        children: new Map(),
        path: path,
        dynamicPath: '',
        handler: handler,
        isLast: false
    };

    return route;
};

const extractParams = (path: string, route: Route, params: Map<string, string>) => {
    const pathParts = splitPath(path);
    const routeParts = splitPath(route.path);

    for (let i = 0; i < routeParts.length; i++) {
        const part = routeParts[i];
        if (part.startsWith(':')) {
            params.set(part.slice(1), pathParts[i]);
        }
    }
};

const createContext = (path: string, route: Route, req: Request): Context => {
    const params: Map<string, string> = new Map();

    if (route) extractParams(path, route, params);

    return { 
        params: params,
        request: req,
        query: new URLSearchParams(path),
        cookies: new Map(),
        formData: undefined,
        logger: undefined,
        json: (statusCode: number, data: any) => http.json(statusCode, data),
     }
};

const Radix = () => {
    let root = createRoute('', () => new Response('not found'));

    const addRoute = (path: string, handler: HttpHandler) => {
        const pathParts = splitPath(path);
        let current = root;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (part.startsWith(':')) {
                current.dynamicPath = part;
            }
            if (!current.children.has(part)) {
                current.children.set(part, createRoute(part, handler));
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

    return {addRoute, findRoute }

};

export { Radix, createContext}