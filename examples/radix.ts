import { router } from '..';

const r = router();

r.add('/', 'GET', async () => new Response('hello world'));
r.add('/foo', 'GET', async () => new Response('foo'));

r.add('/baz/:id', 'GET', async (ctx) => {
    const id = ctx.params.get('id');
    return new Response(`baz ${id}`);
});

r.serve();