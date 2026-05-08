export function createStartupMessage(): string {
  return 'VitalPro Core API bootstrapped';
}

if (process.env.NODE_ENV !== 'test') {
  // Placeholder bootstrap until HTTP interface is implemented.
  console.log(createStartupMessage());
}
