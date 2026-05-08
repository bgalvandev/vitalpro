import { readProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { cleanModuleGenerator } from './clean-module';
import type { CleanModuleGeneratorSchema } from './schema';

describe('clean-module generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('creates a library with clean architecture structure and tags', async () => {
    const options: CleanModuleGeneratorSchema = {
      name: 'patients',
      domain: 'health',
      skipFormat: true,
    };

    await cleanModuleGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'patients');
    expect(config.root).toBe('libs/patients');
    expect(config.tags).toContain('surface:health');
    expect(config.targets?.typecheck).toBeDefined();

    expect(tree.exists('libs/patients/src/domain/patients.entity.ts')).toBe(true);
    expect(tree.exists('libs/patients/src/application/patients.use-case.ts')).toBe(
      true,
    );
    expect(tree.exists('libs/patients/src/infrastructure/index.ts')).toBe(true);
    expect(tree.exists('libs/patients/src/interface/index.ts')).toBe(true);

    const indexContent = tree.read('libs/patients/src/index.ts', 'utf-8');
    expect(indexContent).toContain("export * from './domain';");
  });

  it('supports custom parent directory', async () => {
    const options: CleanModuleGeneratorSchema = {
      name: 'billing',
      domain: 'core',
      directory: 'packages',
      skipFormat: true,
    };

    await cleanModuleGenerator(tree, options);

    const config = readProjectConfiguration(tree, 'billing');
    expect(config.root).toBe('packages/billing');
  });
});
