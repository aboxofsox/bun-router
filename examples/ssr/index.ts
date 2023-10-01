import { Router, http } from '../../';

const router = Router();

router.add('/', 'GET', () => http.ok());
router.static('/page', './examples/ssr/pages');

router.serve();