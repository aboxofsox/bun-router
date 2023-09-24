import { resolveModules } from './resolver';

const modules = await resolveModules('../lib/resolver/testdir');

console.log(modules.length);