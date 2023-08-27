import { router, http } from '..';
import { Context } from '../lib/router/router.d';

const handler = (ctx: Context) => {
    const name = ctx.params.get('name');
    if (typeof name === 'undefined' || name === '') return http.html(500, '<h6 style="color: red">User Undefined</h6>');
    return http.html(200, `<h4>Hello, ${name}!</h4>`);
}

const space = (ctx: Context) => {
    const name = ctx.params.get('name');
    if (typeof name === 'undefined' || name === '') return http.html(404, `<h6 style="color: red">Space [${name}] Not Found</h6>`);
    return http.html(200, `<h4>Welcome to ${name}!</h4>`)
}

const handleSettings = (ctx: Context) => {
    const name = ctx.params.get('name');
    if (typeof name === 'undefined' || name === '') return http.html(404, `<h6 style="color: red">User Not Found</h6>`);
    return http.html(200, `<h4>Settings for ${name}</h4>`)
}

const r = router();

r.add('/u/:name', 'GET', handler);
r.add('/s/:name', 'GET', space);
r.add('/u/:name/settings', 'GET', handleSettings);


r.serve();