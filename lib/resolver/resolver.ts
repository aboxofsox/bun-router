import { FileTree } from '../fs/filetree';
import { readDir } from '../fs/fsys';
import { ComponentType } from 'react';

async function createFileTree(root: string) {
	const tree = FileTree(root);

	await readDir(root, (fp) => {
		tree.addFile(fp);
	});

	return tree;
}

async function resolveModules(root: string) {

	if (!await doesExist(root)) {
		throw new Error(`Directory ${root} does not exist`);
	}

	const tree = await createFileTree(root);
	const files = tree.getFilesByExtension('.tsx');
	const modules: ComponentType[] = [];

	for (const file of files) {
		const module = await import(file);
		modules.push(module);
	}
	return modules;
}

async function doesExist(root: string): Promise<boolean> {
	const file =  Bun.file(root);
	return await file.exists();
}

async function isDir(root: string): Promise<boolean> {
	const file =  Bun.file(root);
	return await file.isDir();
}


export { resolveModules };