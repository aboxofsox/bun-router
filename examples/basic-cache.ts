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