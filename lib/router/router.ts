import { Route, Router, HttpRequest, Options } from './router.d';

const notFound = async (): Promise<Response> => {
    const response = new Response('not found', {
        status: 404,
        statusText: 'not found',
        headers: { 'Content-Type': 'text/html' },
    });

    return new Promise((resolve) => {
        resolve(response);
    });
}

const file = async (filepath: string): Promise<Response> => {
    const file = Bun.file(filepath);
    const exists = await file.exists();

    if (!exists)
        return notFound();

    const content = await file.text();
    if (content === '')
        return notFound();

    const response = new Response(content, {
        status: 200,
        statusText: 'ok',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    return new Promise<Response>((resolve) => {
        resolve(response);
    });
}

const html = async (content: string): Promise<Response> => {
    const response = new Response(content, {
        status: 200,
        statusText: 'ok',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
    content = Bun.escapeHTML(content);

    return new Promise<Response>((resolve) => {
        resolve(response);
    });
}

const json = (data: any): Response => {
    const jsonString = JSON.stringify(data);

    const res = new Response(jsonString);
    res.headers.set('Content-Type', 'application/json');

    return res
}

const extract = (route: Route, req: HttpRequest) => {
    const url = new URL(req.request.url);
    const pathSegments = route.pattern.split('/');
    const urlSegments = url.pathname.split('/');

    if (pathSegments.length !== urlSegments.length) return

    return {
        params: () => {
            for (let i = 0; i < pathSegments.length; i++) {
                if (pathSegments[i][0] === ':' && pathSegments[i - 1] === urlSegments[i - 1]) {
                    const k = pathSegments[i].replace(':', '');
                    const v = urlSegments[i];
                    req.params.set(k, v);
                }
            }
        },
        fs: () => {
            for (let i = 0; i < pathSegments.length; i++) {
                if (pathSegments[i][0] === '[' && pathSegments[i - 1] === urlSegments[i - 1]) {
                    const k = pathSegments[i].replace('[', '').replace(']', '');
                    const v = urlSegments[i];
                    console.log(k, v);
                    req.fs.set(k,v);
                }
            }
        }
    }
    
}

const match = (route: Route, req: HttpRequest): boolean => {
    return req.params.size !== 0 || route.pattern === (new URL(req.request.url)).pathname
}

const router: Router = (port?: number | string, options?: Options) => {
    const routes: Array<Route> = new Array();

    return {
        add: (pattern: string, method: string, callback: (req: HttpRequest) => Response | Promise<Response>) => {
            routes.push({
                pattern: pattern,
                method: method,
                callback: callback,
            })
        },
        serve: () => {
            console.log(`[bun-router]: Listening on port -> :${port ?? 3000}`)
            Bun.serve({
                port: port ?? 3000,
                ...options,
                fetch(req) {
                    const url = new URL(req.url);
                    for (const route of routes) {
                        const httpRequest: HttpRequest = {
                            request: req,
                            params: new Map(),
                            fs: new Map(),
                        };

                        const extractor = extract(route, httpRequest);

                        if (route.pattern.includes('['))
                            extractor?.fs();
                        if (route.pattern.includes(':'))
                            extractor?.params();

                        if (match(route, httpRequest))
                            return route.callback(httpRequest);
                    }
                    return new Response('not found');
                }
            });
        },
    }
}

export { router, json, file, extract, html }