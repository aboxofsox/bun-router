/* eslint-disable  @typescript-eslint/no-explicit-any */
import { TLSWebSocketServeOptions, WebSocketServeOptions, ServeOptions, TLSServeOptions } from 'bun';
import { Logger } from '../logger/logger';
import { Database } from 'bun:sqlite';

type BunRouter = (port?: number | string, options?: RouterOptions) => {
    add: (pattern: string, method: string, callback: HttpHandler) => void;
    get: (pattern: string, callback: HttpHandler) => void;
    post: (pattern: string, callback: HttpHandler) => void;
    put: (pattern: string, callback: HttpHandler) => void;
    delete: (pattern: string, callback: HttpHandler) => void;
    static: (pattern: string, root: string) => void;
    serve: () => void;
}

type Route = {
    children: Map<string, Route>;
    path: string;
    dynamicPath: string;
    method: string;
    handler: HttpHandler;
    isLast: boolean;
}
type Context = {
    db?: Database;
    formData: FormData | Promise<FormData>;
    json: (statusCode: number, data: any) => Response | Promise<Response>;
    logger: Logger;
    params: Map<string, string>;
    query: URLSearchParams;
    request: Request;
    render: (component: React.ReactNode) => Response | Promise<Response>;
};

type HttpHandler = (ctx: Context) => Response | Promise<Response>

type Options = {
    db: string,
}

type RouterOptions<Options> = ServeOptions
| TLSServeOptions<Options>
| WebSocketServeOptions<Options>
| TLSWebSocketServeOptions<Options>
| undefined

export { Context , Route, BunRouter, RouterOptions, Options, HttpHandler };