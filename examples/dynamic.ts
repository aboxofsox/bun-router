import { Router, http } from '..';
import { Context } from '../lib/router/router.d';

const home = () => new Response('Welcome Home', { status: 200 });

const subreddit = (ctx: Context) => {
    const sub = ctx.params.get('subreddit');
    if (!sub) return http.json(400, { error: 'no subreddit provided' });
    return http.json(200, { subreddit: sub });
}

const user = (ctx: Context) => {
    const user = ctx.params.get('user');
    if (!user) return http.json(400, { error: 'no user provided' });
    return http.json(200, { user: user });
}

const r = Router();

r.add('/', 'GET', home);
r.add('/r/:subreddit', 'GET', subreddit);
r.add('/u/:user', 'GET', user);

r.serve();