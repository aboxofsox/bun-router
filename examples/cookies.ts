import { router } from '..';

const r = router();

r.add('/set-cookie', 'GET', ctx => {
    ctx.cookies.set('domain', 'localhost');
    ctx.cookies.set('path', '/set-cookie');

    ctx.logger.message(ctx.token ?? 'no token provided');

    return ctx.json( 200, {message: 'cookie stored'});
});


r.serve();