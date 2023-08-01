import { TLSOptions, TLSWebSocketServeOptions, WebSocketServeOptions, ServeOptions, TLSServeOptions } from 'bun';


type Context = {
    request: Request,
    params: Map<string, string>,
    fs: Map<string, string>,
    token?: string,
}

type Route = {
    pattern: string,
    method: string,
    callback: (req: Context) => Response | Promise<Response>
}

type Options = ServeOptions
| TLSServeOptions
| WebSocketServeOptions
| TLSWebSocketServeOptions
| undefined


type Router = (port?: number | string, options?: Options) => {
    add: (pattern: string, method: string, callback: (req: Context) => Response | Promise<Response>) => void,
    static: (pattern: string, root: string) => void,
    serve: () => void,
}


export { Context , Route, Router, Options }