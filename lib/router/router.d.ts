import { TLSOptions, TLSWebSocketServeOptions, WebSocketServeOptions, ServeOptions, TLSServeOptions } from 'bun';
import { Logger } from '../logger/logger';
import { Database } from 'bun:sqlite';


type Context = {
    cookies: Map<string, string>,
    db: Database,
    formData: FormData | Promise<FormData> | undefined,
    json: (statusCode: number, data: any) => Response | Promise<Response>,
    logger: Logger,
    params: Map<string, string>,
    query: URLSearchParams,
    request: Request,
    route: Route,
    token?: string,
};


type Route = {
    pattern: string,
    method: string,
    callback: (req: Context) => Response | Promise<Response>
}

type Options = {
    db: string,
}

type RouterOptions<Options> = ServeOptions
| TLSServeOptions<Options>
| WebSocketServeOptions<Options>
| TLSWebSocketServeOptions<Options>
| undefined


type Router = (port?: number | string, options?: RouterOptions) => {
    add: (pattern: string, method: string, callback: (req: Context) => Response | Promise<Response>) => void,
    GET: (pattern: string, callback: (ctx: Context) => Response | Promise<Response>) => void,
    POST: (pattern: string, callback: (ctx: Context) => Response | Promise<Response>) => void,
    static: (pattern: string, root: string) => void,
    serve: () => void,
}



export { Context , Route, Router, RouterOptions, Options }