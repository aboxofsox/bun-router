import { TLSOptions, TLSWebSocketServeOptions, WebSocketServeOptions, ServeOptions, TLSServeOptions } from 'bun';
import { Logger } from '../logger/logger';
import { Database } from 'bun:sqlite';


type Context = {
    request: Request,
    route: Route,
    params: Map<string, string>,
    token?: string,
    db: Database,
    logger: Logger,
    json: (data: any) => Response | Promise<Response>,
}

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