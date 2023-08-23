import { httpStatusCodes } from "./status";

const http = {
    json: async (statusCode: number, data: any): Promise<Response> => {
        const jsonString = JSON.stringify(data);
        return Promise.resolve(new Response(jsonString, {
            status: statusCode,
            statusText: httpStatusCodes[statusCode],
            headers: {'Content-Type': 'application/json'},
        }));
    },
    html: async (statusCode: number, content: string): Promise<Response> => {
        content = Bun.escapeHTML(content);
        return Promise.resolve(new Response(Bun.escapeHTML(content), {
            status: statusCode,
            statusText: httpStatusCodes[statusCode],
            headers: {'Content-Type': 'text/html; charset=utf-8'}
        }));
    },
    file: async (statusCode: number, fp: string): Promise<Response> => {
        const file = Bun.file(fp);
        const exists = await file.exists();
    
        if (!exists) return http.notFound(`File not found: ${fp}`);
    
        const content = await file.arrayBuffer();
        if (!content) return http.noContent();
    
        let contentType = 'text/html; charset=utf-9';
    
        if (file.type.includes('image'))
            contentType = file.type + '; charset=utf-8';
    
        return Promise.resolve(new Response(content, {
            status: statusCode,
            statusText: httpStatusCodes[statusCode],
            headers: { 'Content-Type': contentType}
        }));
    },
    noContent: async (): Promise<Response> => Promise.resolve(new Response('no content', {
        status: 204,
        statusText: 'no content',
    })),
    notFound: async(msg?: string): Promise<Response> => {
        const response = new Response(msg ?? 'not found', {
            status: 404,
            statusText: httpStatusCodes[404],
            headers: {'Content-Type': 'text/html'},
        });
    
        return Promise.resolve(response);
    },
    message:  async (status: number, msg?: string): Promise<Response> => {
        const response = new Response(msg ?? '?', {
            status: status,
            statusText: httpStatusCodes[status],
            headers: {'Content-Type': 'text/html; charset-utf-8'},
        });
        return Promise.resolve(response)
    }, 
}

export { http }