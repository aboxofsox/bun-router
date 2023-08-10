import { router, json } from '..';
import { Database } from 'bun:sqlite';

const r = router(3000, {db: './examples/dbs/test.db'});

r.add('/u/new/:name', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    const rando = Math.floor(Math.random()*1000);

    ctx.db.run(`INSERT INTO test VALUES(${rando}, "${name}")`);

    return json({message: 'ok'});
});

r.add('/u/:name', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    const data = ctx.db.query(`SELECT * FROM test WHERE name = "${name}";`).get();
    const d = data as {id: number, name: string};

    return d ? json(d) : new Response('not found', {status: 404});
});

r.serve();
