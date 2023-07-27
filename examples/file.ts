import { router, html } from '..';
import path from 'path';

const r = router();

r.add('/page/:name', 'GET', async req => {
    const pageName = req.params.get('name')!;
    const fullpath = path.join('.', 'examples', 'pages', pageName+'.html');
    return html(fullpath);
});

r.serve();
