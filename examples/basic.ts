import { Router, http } from '..';

const router = Router();

router.add('/', 'GET', () => http.json(200, 'ok'));

router.add('/user/:name', 'GET', (ctx) => {
	const name = ctx.params.get('name');
	if (!name) return http.json(500, 'no name');
	return http.json(200, name);
});

router.serve();