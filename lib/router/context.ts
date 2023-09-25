/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Route, Context } from './router.d';
import { renderToReadableStream } from 'react-dom/server';
import { Logger } from '../logger/logger';
import { http } from './router';
import { ReactNode } from 'react';

async function createContext(path: string, route: Route, request: Request): Promise<Context> {
	const query = new URLSearchParams(path);
	const params = extractParams(path, route);
	const formData = isMultiPartForm(request.headers) ? await request.formData() : new FormData();

	return Promise.resolve({
		params,
		request,
		query,
		formData,
		logger: Logger(),
		json: (statusCode: number, data: any) => http.json(statusCode, data),
		render: async (component: ReactNode) => await renderStream(component),
	});
}

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

function getContentType(headers: Headers): string {
	const contentType = headers.get('Content-Type');
	return contentType ?? '';
}

function isMultiPartForm(headers: Headers): boolean {
	const contentType = getContentType(headers);
	return contentType.includes('multipart/form-data');
}

async function renderStream(children: ReactNode) {
	const stream = await renderToReadableStream(children);
	return new Response(stream, { headers: { 'Content-Type': 'text/html' } });
}

export { createContext };