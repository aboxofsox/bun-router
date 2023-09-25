import path from 'node:path';

type File = {
    name: string;
    path: string;
    extension: string;
    children: Map<string, File>;
    isLast: boolean;
};

function createFile(name: string): File {
	return {
		name,
		path: '',
		extension: '',
		children: new Map(),
		isLast: false,
	};
}

const FileTree = (dir: string) => {
	const root = createFile(dir);

	const addFile = (filepath: string) => {
		const pathParts = filepath.split(path.sep);
		let current = root;

		for (let i = 0; i < pathParts.length; i++) {
			const part = pathParts[i];
			if (!current.children.has(part)) {
				current.children.set(part, createFile(part));
			}
			current = current.children.get(part)!;
		}

		current.isLast = true;
		current.path = filepath;
		current.extension = path.extname(filepath);
	};

	const getFilesByExtension = (extension: string): string[] => {
		let current = root;
		const files: string[] = [];

		for (const [name, file] of current.children) {
			if (file.extension === extension) {
				files.push(file.path);
			}
			current = current.children.get(name)!;
		}

		return files;
	};

	const getFileByName = (filepath: string): string | undefined => {
		let current = root;
		const pathParts = filepath.split(path.sep);
		for (let i = 0; i < pathParts.length; i++) {
			const part = pathParts[i];
			if (current.children.has(part)) {
				current = current.children.get(part)!;
			} else {
				return;
			}
		}

		if (!current.isLast) return;

		return current.path;
	};
    
	return { addFile, getFilesByExtension, getFileByName };
};

export { FileTree };