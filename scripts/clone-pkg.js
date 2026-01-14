import { join, dirname } from 'node:path';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createPackageFile() {
  const root = join(__dirname, '..');
  const packageData = await readFile(join(root, 'package.json'), 'utf8');
  const {
    nyc,
    scripts,
    devDependencies,
    workspaces,
    eslintConfig,
    xo,
    np,
    files,
    ...packageDataOther
  } = JSON.parse(packageData);

  const newPackageData = {
    ...packageDataOther,
    private: false,
    type: 'module',
    main: './index.cjs',
    module: './index.js',
    types: './index.d.ts',
    exports: {
      '.': {
        types: './index.d.ts',
        import: './index.js',
        require: './index.cjs',
      },
    },
  };
  const targetPath = join(root, 'dist/package.json');

  await writeFile(
    targetPath,
    JSON.stringify(newPackageData, null, 2),
    'utf8',
  );

  await copyFile(join(root, 'README.md'), join(root, 'dist/README.md'));

  return newPackageData;
}

await createPackageFile();
