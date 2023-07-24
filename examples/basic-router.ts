import { router, json } from "..";

const r = router({
    port: 3030,
});

const pets = {
    dogs: ['Joey', 'Benny', 'Max'],
    cats: ['Charles', 'Arya', 'Binx'],
}

const foods = {
    apple: '🍎', banana: '🍌', strawberry: '🍓', pear: '🍐',
}

const reverse = (s: string) => [...s].reverse().join('');

const exampleHtml = await Bun.file('./examples/index.html').text();

r.add('/', 'GET', req => {
    const response = new Response(exampleHtml);
    response.headers.set('Content-Type', 'text/html');
    return response;
});

r.add('/pets/:type', 'GET', req => {
    const petType = req.params.get('type') as keyof typeof pets;
    return json(pets[petType] ?? 'not found');
});
r.add('/grocery/:food', 'GET', req => {
    const food = req.params.get('food') as keyof typeof foods
    return json(foods[food] ?? 'not found')
});

r.add('/reverse/:name', 'GET', req => {
    const name = req.params.get('name')!;
    return json(reverse(name));
});

r.serve();
