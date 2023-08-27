import { router, http } from '..';

const r = router();

r.add('/', 'GET', () => http.json(200, 'ok'));

r.add('/user/:name', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    if (!name) return http.json(500, 'no name');
    return http.json(200, name);
});

r.serve();