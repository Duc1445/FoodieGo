import pool from '../../config/database.js';

export class HealthController {
  async live(req, res) {
    res.json({ status: 'UP' });
  }

  async ready(req, res) {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'UP', dependencies: { database: 'UP' } });
    } catch (error) {
      res.status(503).json({ status: 'DOWN', dependencies: { database: 'DOWN', error: error.message } });
    }
  }

  async health(req, res) {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
  }

  async version(req, res) {
    res.json({
      service: 'restaurant-service',
      version: process.env.npm_package_version || '1.0.0',
      gitCommit: process.env.GIT_COMMIT || 'unknown',
      buildTime: process.env.BUILD_TIME || new Date().toISOString()
    });
  }
}
