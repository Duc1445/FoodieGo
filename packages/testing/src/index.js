export const getMockDependencies = () => ({
  logger: {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {}
  },
  metrics: {
    increment: () => {},
    gauge: () => {},
    histogram: () => {}
  }
});
