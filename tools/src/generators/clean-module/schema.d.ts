export type CleanModuleDomain = 'core' | 'health';

export interface CleanModuleGeneratorSchema {
  name: string;
  domain: CleanModuleDomain;
  directory?: string;
  skipFormat?: boolean;
}
