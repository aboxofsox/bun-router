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
r.add('/pets/:type/add', 'POST', req => {
    const petType = req.params.get('type') as keyof typeof pets;
    const url = new URL(req.request.url);
    const query = url.searchParams;

    const name = query.get('name');
    if (!name) return json('invalid query params');
    
    pets[petType].push(name);

    return json('ok');
    
});
r.add('/grocery/:food', 'GET', req => {
    const food = req.params.get('food') as keyof typeof foods
    return json(foods[food] ?? 'not found')
});

r.serve();