import app from '../app.js';

describe('Smoke Test', () => {
  it('Should boot the application without circular dependency errors', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
