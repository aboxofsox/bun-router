import { router, html, json } from '..';

const r = router();

const aliens = '👽'.repeat(30);

r.add('/', 'GET', (req) => {
    const message = {
        page: 'home',
        space: 'home',
        body: 'ok'
    };
    return json(message);
});

r.serve();