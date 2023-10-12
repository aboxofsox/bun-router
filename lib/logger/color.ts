const Colors: Record<string,string> = {
	reset: '\x1b[0m',
  
	// foreground
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
  
	// background
	bgBlack: '\x1b[40m',
	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
	bgBlue: '\x1b[44m',
	bgMagenta: '\x1b[45m',
	bgCyan: '\x1b[46m',
	bgWhite: '\x1b[47m',
} as const;

  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function color(foreground: string, background: string, ...args: any[]) {
	const _foreground = Colors[foreground];
	const _background = Colors[background];
	const reset = Colors.reset;
	return `${_foreground}${_background}${args.map(String).join('')}${reset}`;
}


  
export { color };