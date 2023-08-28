# Bun Router

I needed a router for `Bun`, so I made one. It's simple, naive, and hardly anything is abstracted. 

### Usage
```typescript
import { router } from 'bun-router';

const r = router();

r.add('/', 'GET', (ctx) => new Response('Hello World'));

r.serve();
```
#### Static Files
```typescript
import { router } from 'bun-router';

const r = router();

r.static('/', './pages');

r.serve();
```

##### Example
```typescript
import {router, html, json } from 'bun-router';

const r = router(3001);

r.add('/', (ctx) => html('<h1>Hello World</h1>'));

r.add('/greeting/:name', 'GET', (ctx) => {
    const name = ctx.params.get('name');
    if (!name) return new Response('invalid url parameters', {status: 400});

    return html(`<h4>Greetings, ${name}!</h4>`);
});

const store: Map<string, string> = new Map();

r.add('/user/:id', 'GET', (ctx) => {
    const id = ctx.params.get('id');
    if (!id) return new Response('user not found', {status: 404});
    
    const user = store.get(id);

    if (!user) return new Response('user not found', { status: 404 });

    return json(user);
});

r.serve();
```

**SQLite**
```ts
import { router, json } from 'bun-router';
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

```