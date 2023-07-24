import { ServerOptions } from 'http';
import { Route, Router, HttpRequest } from './router.d';
import { TLSOptions, TLSWebSocketServeOptions, WebSocketServeOptions } from 'bun';

const json = (data: any): Response  => {
    const jsonString = JSON.stringify(data);

    const res = new Response(jsonString);
    res.headers.set('Content-Type', 'application/json');

    return res
}


const router: Router = (options: ServerOptions | TLSOptions | WebSocketServeOptions | TLSWebSocketServeOptions) => {
    const routes: Array<Route> = new Array();

    function extractParams(route: Route, req: HttpRequest) {
        const url = new URL(req.request.url);

        const pathSegments = route.pattern.split('/');
        const urlSegments = url.pathname.split('/');

        if (pathSegments.length !== urlSegments.length) return

        for (let i = 0; i < pathSegments.length; i++) {
            if ((pathSegments[i][0] === ':') && (pathSegments[i - 1] === urlSegments[i - 1])) {
                const k = pathSegments[i].replace(':', '');
                const v = urlSegments[i];
                req.params.set(k, v);
            }
        }
    }

    return {
        add: (pattern: string, method: string, callback: (req: HttpRequest) => Response) => {
            routes.push({
                pattern: pattern,
                method: method,
                callback: callback,
            })
        },
        serve: () => {
            Bun.serve({
                ...options,
                fetch(req) {
                    const url = new URL(req.url);
                    for (const route of routes) {
                        const httpRequest: HttpRequest = {
                            request: req,
                            params: new Map(),
                        };

                        extractParams(route, httpRequest);

                        if (httpRequest.params.size !== 0 && route.method === req.method) 
                            return route.callback(httpRequest);

                        else if (url.pathname === route.pattern && route.method === req.method) 
                            return route.callback(httpRequest);
                    }
                    return new Response('not found');
                }
            });
        },
    }
}

export { router, json }