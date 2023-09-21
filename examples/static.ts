import { Router } from '..';

const r = Router(3001);

r.static('/', './pages');
r.serve();