import { router, file } from '..';

Bun.serve

const r = router(3000);

r.add('/', 'GET', () => file('./examples/pages/index.html'));

r.serve();
