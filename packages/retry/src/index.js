export async function withRetry(operation, options = {}) {
  const { maxRetries = 3, baseDelayMs = 1000 } = options;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
