import { router, html } from '..';

const r = router({port: 3000});

r.add('/', 'GET', () => html('./examples/pages/index.html'));

r.serve();
