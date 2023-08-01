import { router, html, json } from '..';

const r = router();

r.add('/', 'GET', () => json('ok'));

r.add('/user/:name', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    return json(name);
});

r.add('/user/:name/:id', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    const id = ctx.params.get('id');
    return json({name: name, id: id});
});

r.serve();