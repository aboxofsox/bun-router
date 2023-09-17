import { Route, Context } from "./router.d";
import { Logger } from "../..";
import { http } from "./router";

async function createContext(path: string, route: Route, request: Request): Promise<Context> {
    const params = extractParams(path, route);
    const query = new URLSearchParams(path);
    const formData = isMultiPartForm(request.headers) ? await request.formData() : new FormData();

    return Promise.resolve({
        params,
        request,
        query,
        formData,
        logger: Logger(),
        json: (statusCode: number, data: any) => http.json(statusCode, data),
    });
}

function extractParams(path: string, route: Route): Map<string, string> {
    const params: Map<string, string> = new Map();
    const pathSegments = path.split('/');
    const routeSegments = route.path.split('/');

    if (pathSegments.length !== routeSegments.length) return params;

    for (let i = 0; i < pathSegments.length; i++) {
        if (routeSegments[i][0] === ':') {
            const key = routeSegments[i].replace(':', '');
            const value = pathSegments[i];
            params.set(key, value);
        }
    }

    return params;
}

function getContentType(headers: Headers): string {
    const contentType = headers.get('Content-Type');
    if (!contentType) return '';
    return contentType;
}

function isMultiPartForm(headers: Headers): boolean {
    const contentType = getContentType(headers);
    return contentType.includes('multipart/form-data');
}



export { createContext }