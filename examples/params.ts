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

