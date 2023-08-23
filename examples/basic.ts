import { router, http } from '..';

const r = router();

r.add('/', 'GET', () => http.json(200, 'ok'));

r.add('/user/:name', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    return http.json(200, name);
});

r.add('/user/:name/:id', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    const id = ctx.params.get('id');
    return http.json(200, {name: name, id: id});
});

r.serve();