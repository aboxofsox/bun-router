import { Router } from '..';

const r = Router(3001);

r.static('/page', './pages');

r.serve();