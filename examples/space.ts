import { router, html, json } from '..';

const r = router();

const aliens = '👽'.repeat(30);

r.add('/space', 'GET', () => html(`<h1>${aliens}</h1>`))

r.serve();