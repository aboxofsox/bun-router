import { router, json, } from '..';

const r = router({port: 3000});

const userStore = new Map();
const rando = (max: number) => `${Math.floor(Math.random() * max)}`

r.add('/new', 'POST', req => {
    const url = new URL(req.request.url);
    const query = url.searchParams;

    const name = query.get('name');
    const email = query.get('email');

    if (typeof name === 'undefined' || typeof email === 'undefined') 
        return new Response('invalid query parameters');
    

    const id = rando(2_000_000);
    userStore.set(id, {name: name, email: email});

    const message = `Thank you, ${name} for registering your email: ${email}.\nYour ID is ${id}`
    return new Response(message);
});

r.add('/user/:id', 'GET', req => {
    const id = req.params.get('id');
    if (typeof id === 'undefined') 
        return new Response('invalid id');
    
    const user = userStore.get(id);
    if (typeof user === 'undefined') 
        return new Response('not found');

    return json(user);
});

r.serve();