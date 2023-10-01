import { color } from './color';


const TITLE = `
_                          _           
| |_ _ _ ___    ___ ___ _ _| |_ ___ ___ 
| . | | |   |  |  _| . | | |  _| -_|  _|
|___|___|_|_|  |_| |___|___|_| |___|_|  
                                                                                    
`;
const VERSION = '0.7.4-experimental.10';
const Logger = (enableFileLogging: boolean) => {
	const file = Bun.file('bun-router.log');
	const writer = enableFileLogging ? file.writer() : null;

	function stripAnsi(str: string) {
		const ansiRegex = /\u001B\[(?:[0-9]{1,3}(?:;[0-9]{1,3})*)?[m|K]/g;
		return str.replace(ansiRegex, '');
	}

	async function write(message: string) {
		await Bun.write(Bun.stdout, message);
		if (writer) {
			writer.write(stripAnsi(message));
			writer.flush();
		}
	}

	return {
		info: async (statusCode: number, routePath: string, method: string, message?: string) => {
			const { stamp } = timestamp((new Date(Date.now())));
			const source = color('green', 'bgBlack', `[bun-router ${stamp}]`);
			const rp = color('white', 'bgBlack', routePath);

			message = `${source}: ${setColor(statusCode)}: ${rp} ${(method === 'GET') ? ' ->' : ' <-'} ${method} ${ message ?? ''}\n`;

			await write(message);

		},
		error: async (statusCode: number, routePath: string, method: string, error: Error) => {
			const { stamp } = timestamp((new Date(Date.now())));
			const source = color('black', 'bgRed', `[error ${stamp}]`);
			const rp = color('white', 'bgBlack', routePath);

			const message = `${source}: ${setColor(statusCode)}: ${rp} ${(method === 'GET') ? ' -> ' : ' <-'} ${error.message}\n`;

			await write(message);
		},
		warn: async (message: string) => {
			const { stamp } = timestamp((new Date(Date.now())));
			const source = color('black', 'bgYellow', `[warning ${stamp}]`);
			const messageColor = color('yellow', 'bgBlack', message);

			message = `${source} : ${messageColor}\n`;

			await write(message);
		},
		message: async (message: string) => {
			const { stamp } = timestamp((new Date(Date.now())));
			const source = color('black', 'bgCyan', `[message ${stamp}]`);
			const messageColor = color('yellow', 'bgBlack', message);

			message = `${source}: ${messageColor}\n`;

			await write(message);
		},

	};
};

function timestamp(date: Date) {
	const month = pad(date.getMonth());
	const day = pad(date.getDate());
	const hour = pad(date.getHours());
	const minute = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());
	const stamp = `${hour}:${minute}:${seconds}`;

	return {month, day, hour, minute, stamp};
}

function setColor(n: number, text?: string){
	const s = ` [${String(n)}${text ?? ''}] `;

	if (n < 100) return color('black', 'bgYellow', s);
	else if (n >= 100 && n < 200) return color('black', 'bgCyan', s);
	else if (n >= 200 && n < 300) return color('black', 'bgGreen', s);
	else if (n >= 300 && n < 400) return color('black', 'bgRed', s);
	else if (n >= 400 && n < 500) return color('black', 'bgRed', s);
	else if (n >= 500) return color('white', 'bgRed', s);

	return color('white', 'bgBlack', `[${s}]`).trim();
}

function startMessage(port: number | string) {
	const { stamp } = timestamp((new Date(Date.now())));
	const source = color('green', 'bgBlack', `[bun-router ${stamp}]`);
	const portColor = color('green', 'bgBlack', String(port));
	const msg = `${source}: Starting Server on :${portColor}\n`;
	const version = color('red', 'bgBlack', `v${VERSION}\n`);

	Bun.write(Bun.stdout, TITLE + '\n' + version);
	Bun.write(Bun.stdout, msg);
}

function pad(n: number) {
	return String(n).padStart(2, '0');
}

export { Logger, startMessage };
