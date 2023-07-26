import { router, html } from '..';

Bun.serve

const r = router(3000);

r.add('/', 'GET', () => html('./examples/pages/index.html'));

r.serve();
