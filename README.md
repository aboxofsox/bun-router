# Bun Router

I needed a router for `Bun`, so I made one. It's simple, naive, and hardly anything is abstracted. 

### Usage
Import the `router`.
```typescript
import { router } from 'bun-router';
```

Create the `router`.
```typescript
const r = router(3000)
```

Add routes to the `router`.
```typescript
r.add('/', 'GET', req => new Response('Hello World'));
```

The `req` parameter is of type `HttpRequest` which is just a type that contains both `Response` and `Params` for URL parameters. 

Start the server.
```typescript
r.serve()
```

Some overly-simple examples: 
```typescript 
import { router, json } from '..';

const r = router();

const pets = {
    dogs: ['Joey', 'Benny', 'Max'],
    cats: ['Charles', 'Arya', 'Binx'],
}

const foods = {
    apple: '🍎', banana: '🍌', strawberry: '🍓', pear: '🍐',
}

r.add('/pets/:type', 'GET', req => {
    const petType = req.params.get('type') as keyof typeof pets;
    return json(pets[petType] ?? 'not found');
});
r.add('/grocery/:food', 'GET', req => {
    const food = req.params.get('food') as keyof typeof foods
    return json(foods[food] ?? 'not found')
});

r.serve();
```

```typescript
import { router, json } from "..";

const r = router();


const cacher = () => {
    const cache = new Map();
    return {
        set: (key: string, value: string) => {
            cache.set(key, value);
        },
        get: (key: string) => cache.get(key)!,
    }
}

const cache = cacher();

const rand = (max: number) => Math.floor(Math.random() * max);

r.add('/set', 'POST', req => {
    const url = new URL(req.request.url);
    const query = url.searchParams;

    const name = query.get('name')!;

    cache.set(name, `${rand(1000)}`)

    return new Response('thank you for joining\n');
});

r.add('/get/:key', 'GET', req => {
    const name = req.params.get('key')
    const result = cache.get(name ?? '');

    if (!result) return new Response('not found')
    
    return json(`Welcome user ID: ${result}`)

});

r.serve();
```

