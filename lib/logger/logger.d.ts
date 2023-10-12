type BunLogger = {
    info: (statusCode: number, routePath: string, method: string, ...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-explicit-any

    error: (statusCode: number, routePath: string, method: string, error: Error) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
    warn: (...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
    message: (...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { BunLogger };