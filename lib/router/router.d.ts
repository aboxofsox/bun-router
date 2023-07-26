import { TLSOptions, TLSWebSocketServeOptions, WebSocketServeOptions, ServeOptions, TLSServeOptions } from 'bun';


type HttpRequest = {
    request: Request,
    params: Map<string, string>,
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
    serve: () => void,
}


export { HttpRequest, Route, Router, Options }