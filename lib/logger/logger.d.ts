type BunLogger = {
    info: (statusCode: number, routePath: string, method: string, message?: string) => void,
    error: (statusCode: number, routePath: string, method: string, error: Error) => void,
    warn: (message: string) => void,
    message: (message: string) => void,
}

export { BunLogger }