type Logger = {
    start: (port: number | string) => void,
    info: (statusCode: number, routePath: string, method: string, message?: string) => void,
    error: (statusCode: number, routePath: string, method: string, error: Error) => void,
    warn: (msg: string) => void,
}

export { Logger }