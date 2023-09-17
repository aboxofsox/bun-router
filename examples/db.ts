import { Router, http } from '..';

const router = Router(3000, {db: './dbs/test.db'});

router.add('/', 'GET', async (ctx) => {
    const formData = await ctx.formData;
    const name = formData?.get('name');
    return http.ok();
});

