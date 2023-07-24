# Bun Router

I needed a router for `Bun`, so I made one. It's simple, naive, and hardly anything is abstracted. 

### Usage
Import the `router`.
```typescript
import { router } from 'bun-router';
```

Create the `router`.
```typescript
const r = router()
```

Add routes to the `router`.
```typescript
r.add('/', 'GET', req => new Response('Hello World'));
```

The `req` parameter is of type `HttpRequest` which is just a type that contains both `Response` and `Params` for URL parameters. 

Start the server.
```typescript
r.serve();
```

Some overly-simple examples: 
```typescript 
import { router, json } from 'bun-router';

const r = router();

const pets = {
	dogs: ['Joey', 'Benny', 'Max'],
	cats: ['Binx', 'Charles', 'Arya'],
}

r.add('/pets/:type', 'GET', req => {
	const petType = req.params.get('type') as keyof typeof pets;
	return json(pets[petType])
});

r.serve();
```

```typescript
import { router, json } from 'bun-router';

const r = router({
    port: 3001
});

const store: Map<string, string> = new Map();

const rando = (max: number): number => Math.floor(Math.random() * max);

r.add('/set', 'POST', req => {
    const url = new URL(req.request.url);
    const query = url.searchParams;

    const name = query.get('name')!;
    store.setItem(name, `${rando(1000)}`);

    return new Response('user saved');
});

r.add('/get/:name', 'GET', req => {
    const name = req.params.get('name') ?? '';
    const id = store.getItem(name);

    if (!id) return new Response('user not found');
    
    return json({status: 'ok', id: id});
});
