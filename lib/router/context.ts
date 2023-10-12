/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Route, Context } from './router.d';
import { renderToReadableStream } from 'react-dom/server';
import { Logger } from '../logger/logger';
import { http } from './router';
import { ReactNode } from 'react';

// createContext creates a context object
async function createContext(path: string, route: Route, request: Request, enableFileLogging: boolean): Promise<Context> {
	const query = new URLSearchParams(path);
	const params = extractParams(path, route);
	const formData = isMultiPartForm(request.headers) ? await request.formData() : new FormData();

	return Promise.resolve({
		params,
		request,
		query,
		formData,
		logger: Logger(enableFileLogging),
		json: (statusCode: number, data: any) => http.json(statusCode, data),
		render: async (component: ReactNode) => await renderStream(component),
	});
}

// extractParams extracts the parameters from the path
// and returns a map of key/value pairs
// e.g. /users/:id => /users/123 => { id: 123 }
function extractParams(pattern: string, route: Route): Map<string, string> {
	const params: Map<string, string> = new Map();
	const pathSegments = pattern.split('/');
	const routeSegments = route.path.split('/');

	if (pathSegments.length !== routeSegments.length) return params;

	for (let i = 0; i < pathSegments.length; i++) {
		if (routeSegments[i][0] === ':') {
			const key = routeSegments[i].slice(1);
			const value = pathSegments[i];
			params.set(key, value);
		}
	}

	return params;
}

// getContentType returns the content type from the headers
function getContentType(headers: Headers): string {
	const contentType = headers.get('Content-Type');
	return contentType ?? '';
}

// isMultiPartForm returns true if the content type is multipart/form-data
function isMultiPartForm(headers: Headers): boolean {
	const contentType = getContentType(headers);
	return contentType.includes('multipart/form-data');
}

// renderStream renders the component to a readable stream
async function renderStream(children: ReactNode) {
	const stream = await renderToReadableStream(children);
	return new Response(stream, { headers: { 'Content-Type': 'text/html' } });
}

export { createContext };