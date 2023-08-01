import { router } from '..';

const r = router(3001);

r.static('/', './examples/pages');
r.serve();