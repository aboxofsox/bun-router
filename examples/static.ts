import { Router } from '..';

const r = Router(3001);

r.static('/', './examples/pages');

r.serve();