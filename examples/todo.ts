import { router, http } from '..';
import { Context } from '../lib/router/router.d';

const Todo = () => {
    const list: Record<string, string> = {};

    return {
        add: (key: string, value: string) => { list[key] = value },
        get: (key: string) => list[key],
        remove: (key: string) => { delete list[key] },
        size: () => Object.entries(list).length,
        export: () => list,
    }
}

const todo = Todo();

const r = router();

r.add('/api/new', 'POST', ctx => {
    const query = new URL(ctx.request.url).searchParams;
    const key = query.get('key');
    const content = query.get('content');

    if (!key || !content) return http.message(400, 'invalid query params');
    ctx.logger.message(`Adding ${key} with ${content}`);
    todo.add(key, content);

    return ctx.json({ message: 'ok' });
});

r.add('/api/todo/:key', 'GET', ctx => {
    const key = ctx.params.get('key');
    if (!key) return http.message(400, 'invalid params');

    const content = todo.get(key);
    if (!content) return http.notFound();

    return ctx.json({key: key, content: content});
});

r.add('/api/get/all', 'GET', ctx => {
    return ctx.json(todo.export());
});

r.serve();



