const {join} = require('path');
const fs = require('fs-extra');

async function createPackageFile() {
	const root = join(__dirname, '..');
	const packageData = await fs.readFile(
		join(root, 'package.json'),
		'utf8'
	);
	const {
		nyc,
		scripts,
		devDependencies,
		workspaces,
		eslintConfig,
		xo,
		np,
		...packageDataOther
	} = JSON.parse(packageData);
	const newPackageData = {
		...packageDataOther,
		private: false,
		main: './index.js',
		typings: './index.d.ts'
	};
	const targetPath = join(root, 'dist/package.json');

	await fs.writeFile(
		targetPath,
		JSON.stringify(newPackageData, null, 2),
		'utf8'
	);
	console.log(`Created package.json in ${targetPath}`);

	return newPackageData;
}

(async () => createPackageFile())();
