export const healthDomainName = 'VitalPro Health Domain';

export function createHealthRecordSeed(id: string): string {
  return `health-record:${id}`;
}
