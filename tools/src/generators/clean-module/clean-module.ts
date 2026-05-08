import {
  formatFiles,
  generateFiles,
  getProjects,
  joinPathFragments,
  names,
  readJson,
  updateProjectConfiguration,
  writeJson,
  type Tree,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import * as path from 'path';

import type { CleanModuleGeneratorSchema } from './schema';

export async function cleanModuleGenerator(
  tree: Tree,
  options: CleanModuleGeneratorSchema,
) {
  const moduleNames = names(options.name);
  const rootDirectory = options.directory ?? 'libs';
  const projectDirectory = joinPathFragments(rootDirectory, moduleNames.fileName);
  const previousProjects = new Set(getProjects(tree).keys());

  const installTask = await libraryGenerator(tree, {
    directory: projectDirectory,
    bundler: 'tsc',
    linter: 'eslint',
    unitTestRunner: 'vitest',
    testEnvironment: 'node',
    strict: true,
    useProjectJson: true,
    config: 'project',
    addPlugin: false,
    skipFormat: true,
    tags: [`surface:${options.domain}`, 'type:lib'].join(','),
  });

  const projects = getProjects(tree);
  const createdProjectName = [...projects.keys()].find(
    (name) => !previousProjects.has(name),
  );
  if (!createdProjectName) {
    throw new Error('Unable to resolve generated project name.');
  }

  const createdProject = projects.get(createdProjectName);
  if (!createdProject) {
    throw new Error(`Project "${createdProjectName}" was not created.`);
  }

  const sourceRoot =
    createdProject.sourceRoot ?? joinPathFragments(createdProject.root, 'src');

  tree.delete(joinPathFragments(sourceRoot, 'lib'));
  tree.delete(joinPathFragments(sourceRoot, 'index.ts'));

  const tsconfigPath = joinPathFragments(createdProject.root, 'tsconfig.json');
  const tsconfigLibPath = joinPathFragments(
    createdProject.root,
    'tsconfig.lib.json',
  );
  const tsconfigSpecPath = joinPathFragments(
    createdProject.root,
    'tsconfig.spec.json',
  );

  const tsconfig = readJson(tree, tsconfigPath);
  tsconfig.compilerOptions = {
    ...(tsconfig.compilerOptions ?? {}),
    module: 'NodeNext',
  };
  writeJson(tree, tsconfigPath, tsconfig);

  const tsconfigLib = readJson(tree, tsconfigLibPath);
  tsconfigLib.compilerOptions = {
    ...(tsconfigLib.compilerOptions ?? {}),
    rootDir: './src',
  };
  writeJson(tree, tsconfigLibPath, tsconfigLib);

  const tsconfigSpec = readJson(tree, tsconfigSpecPath);
  tsconfigSpec.compilerOptions = {
    ...(tsconfigSpec.compilerOptions ?? {}),
    rootDir: '.',
  };
  writeJson(tree, tsconfigSpecPath, tsconfigSpec);

  generateFiles(tree, path.join(__dirname, 'files'), createdProject.root, {
    tmpl: '',
    name: moduleNames.fileName,
    module: moduleNames,
  });

  updateProjectConfiguration(tree, createdProjectName, {
    ...createdProject,
    targets: {
      ...createdProject.targets,
      typecheck: {
        executor: 'nx:run-commands',
        options: {
          command: `pnpm exec tsc -p ${createdProject.root}/tsconfig.lib.json --noEmit`,
        },
      },
    },
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return installTask;
}

export default cleanModuleGenerator;
