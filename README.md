# Bun router

### Usage
`npm i -s bun-router` 

or 

`bun i bun-router`


#### Examples
##### URL Parameters
```ts
import { Router, http } from 'bun-router';

const router = Router();

router.add('/', 'GET', () => http.ok());

router.get('/u/:username', ctx => {
    const username = ctx.params.get('username');

    if (!username) return http.badRequest();

    return ctx.json({ username: username });
});

router.serve();
```

##### Static
```ts
import { Router } from 'bun-router';

const router = Router();

router.static('/assets', 'static');

router.serve();
```

##### SQLite
```ts
import { Router } from 'bun-router'

const router = Router(3000, { db: 'test.db'});

router.post('/register', ctx => {
    const query = ctx.db.query("select 'Hello' as message;");

    return http.ok(query.get());
});

```


