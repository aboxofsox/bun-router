import { color } from './color';
import {Logger} from './logger.d';

const pad = (n: number) => String(n).padStart(2, '0'); 

const TITLE = `
_                          _           
| |_ _ _ ___    ___ ___ _ _| |_ ___ ___ 
| . | | |   |  |  _| . | | |  _| -_|  _|
|___|___|_|_|  |_| |___|___|_| |___|_|  
                                                                                    
`

const timestamp = (date: Date) => {
    const month = pad(date.getMonth());
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const stamp = `${hour}:${minute}:${seconds}`;

    return {month, day, hour, minute, stamp};
}

// append ANSI color escape sequences to a string based on the given HTTP status code.
const colorCode = (n: number, text?:string): string => {
    const s = ` [${String(n)}${text ?? ''}] `;
    if (n < 100) return color('black', 'bgYellow', s);
    else if (n >= 100 && n < 200) return color('black', 'bgCyan', s);
    else if (n >= 200 && n < 300) return color('black', 'bgGreen', s);
    else if (n >= 300 && n < 400) return color('black', 'bgRed', s);
    else if (n >= 400 && n < 500) return color('black', 'bgRed', s);
    else if (n >= 500) return color('white', 'bgRed', s);
    return color('white', 'bgBlack', `[${s}]`).trim();
}


const clean = (s: string) => s.replace(/\x1B\[\d{1,2}(;\d{1,2}){0,2}m/g, '');

const format = (statusCode: number, routePath: string, method: string, message?: string): string => {
    const { stamp } = timestamp((new Date(Date.now())));
    const source = color('green', 'bgBlack', `[bun-router ${stamp}]`);
    const rp = color('white', 'bgBlack', routePath);

    return `${source} : ${colorCode(statusCode)} : ${rp} ${(method === 'GET') ? '->' : '<-'} ${method}\n`
}

const logger = (): Logger => {
    const messages: string[] = [];
    const errors: string[] = [];
    return {
        // initial log message
        start: async (port: number | string) => {
            const { stamp } = timestamp((new Date(Date.now())));
            const source = color('green', 'bgBlack', `[bun-router ${stamp}]`)
            const portColor = color('green', 'bgBlack', String(port));
            const msg = `${source}: Starting Server on :${portColor}\n`;

            await Bun.write(Bun.stdout, TITLE);
            await Bun.write(Bun.stdout, msg);
        },
        info: async (statusCode: number, routePath: string, method: string, message?: string) => {
            const { stamp } = timestamp((new Date(Date.now())));
            const source = color('green', 'bgBlack', `[bun-router ${stamp}]`);
            const rp = color('white', 'bgBlack', routePath);
            const msg = `${source}: ${colorCode(statusCode)}: ${rp} ${(method === 'GET') ? '->' : '<-'} ${method}${' | ' +message ?? ''}\n`

            await Bun.write(Bun.stdout, msg);

            messages.push(clean(msg));
        },
        error: async (statusCode: number, routePath: string, method: string, error: Error) => {
            const { stamp } = timestamp((new Date(Date.now())));
            const source = color('black', 'bgRed', `[error ${stamp}]`);
            const rp = color('white', 'bgBlack', routePath);
            const msg = `${source}: ${colorCode(statusCode)}: ${rp} ${(method === 'GET') ? '->' : '<-'} ${error.message}\n`;

            await Bun.write(Bun.stdout, msg);

            errors.push(clean(msg));
        },
        warn: async (msg: string) => {
            const { stamp } = timestamp((new Date(Date.now())));
            const source = color('black', 'bgYellow', `[warning ${stamp}]`);
            const msgColor = color('yellow', 'bgBlack', msg);
            msg = `${source} : ${msgColor}\n`;
            await Bun.write(Bun.stdout, msg);
        },
        message: async (msg: string) => {
            const { stamp } = timestamp((new Date(Date.now())));
            const source = color('black', 'bgCyan', `[message ${stamp}]`);
            const msgColor = color('yellow', 'bgBlack', msg);
            msg = `${source}: ${msgColor}\n`;
            await Bun.write(Bun.stdout, msg);

            messages.push(clean(msg));
        }
    }
}

export { logger }