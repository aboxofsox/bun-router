import { Router, http } from '../../';
import { User } from './components/user';

const router = Router();

router.get('/', () => {
	return http.ok();
});


router.get('/u/:username', async ctx => {
	const username = ctx.params.get('username');

	if (!username) return http.message(400, 'invalid username');

	return http.render(User(username));
});

router.serve();

