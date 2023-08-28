import { describe, test, expect } from 'bun:test';

describe('Router', () => {
    test('Serve', async () => {
        const proc = Bun.spawn(['./tests/serve.test.sh'], {
            onExit: (_proc, _exitCode, _signalCode , error) => {
                if (error) console.error(error);     
            },
        });
    
        const text = await new Response(proc.stdout).text();
        
        const hasFailed = text.includes('Failed');

        if (hasFailed) console.log(text);

        expect(hasFailed).toBe(false);

        proc.kill(0);
    })

    test('Static', async() => {
        const proc = Bun.spawn(['./tests/static.test.sh']);
        
        const text = await new Response(proc.stdout).text();

        const hasFailed = text.includes('Failed');
        if (hasFailed) console.log(text);

        expect(hasFailed).toBe(false);

        proc.kill(0);
    });
});

