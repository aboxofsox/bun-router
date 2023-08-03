import { router, logger, json, html } from '..';

const r = router();
const log = logger();

r.add('/:foo', 'GET', (ctx) => {
    const url = new URL(ctx.request.url);
    const foo = ctx.params.get('foo');
    if (!foo) {
        log.error(500, url.pathname, ctx.request.method, new Error('undefined'));
        return json({status: 500, text: 'Foo is undefined'});
    }
    return html(`<h4 style='font-family: sans-serif;'>Oh hello, ${foo}</h4>`)
});

r.serve();