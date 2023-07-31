import { TLSOptions, TLSWebSocketServeOptions, WebSocketServeOptions, ServeOptions, TLSServeOptions } from 'bun';


type HttpRequest = {
    request: Request,
    params: Map<string, string>,
    fs: Map<string, string>,
    token?: string,
}

type Route = {
    pattern: string,
    method: string,
    callback: (req: HttpRequest) => Response | Promise<Response>
}

type Options = ServeOptions
| TLSServeOptions
| WebSocketServeOptions
| TLSWebSocketServeOptions
| undefined


type Router = (port?: number | string, options?: Options) => {
    add: (pattern: string, method: string, callback: (req: HttpRequest) => Response | Promise<Response>) => void,
    fs: (root: string) => void,
    serve: () => void,
}


export { HttpRequest, Route, Router, Options }