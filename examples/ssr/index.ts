import { Router } from '../../';

const router = Router();

router.static('/page', './examples/ssr/pages');

router.serve();