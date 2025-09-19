export function serializeError(err: unknown) {
  if (err instanceof Error) {
    const base = { name: err.name, message: err.message };
    return process.env.NODE_ENV === 'production' ? base : { ...base, stack: err.stack };
  }
  return process.env.NODE_ENV === 'production' ? { message: 'Unknown error' } : { value: err };
}
