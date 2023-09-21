import { Router } from '../../';

const router = Router();

router.static('/', './examples/ssr/pages');

router.serve();