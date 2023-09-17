import { Router, http } from '..';

const r = Router();

r.get('/', ctx => {
    ctx.logger.debug('hello from home');
    
    return http.ok();
});

r.serve();