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
	const tree = await createFileTree(root);
	const files = tree.getFilesByExtension('.tsx');
	const modules: ComponentType[] = [];

	for (const file of files) {
		const module = await import(file) as ComponentType;
		modules.push(module);
	}

	return modules;
}

export { resolveModules };
