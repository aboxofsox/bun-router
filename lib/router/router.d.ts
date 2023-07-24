type HttpRequest = {
    request: Request,
    params: Map<string, string>,
}

type Route = {
    pattern: string,
    method: string,
    callback: (req: HttpRequest) => Response
}


type Router = (options?:ServerOptions | TLSOptions | WebSocketServeOptions | TLSWebSocketServeOptions) => {
    add: (pattern: string, method: string, callback: (req: HttpRequest) => Response) => void,
    serve: () => void,
}

export { HttpRequest, Route, Router }