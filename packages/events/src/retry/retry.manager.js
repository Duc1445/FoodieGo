import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RetryManager {
  constructor() {
    const configPath = path.resolve(__dirname, '../../config/retry.policy.json');
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * Determine what to do when a message fails.
   * @param {string} eventType 
   * @param {number} currentAttempt (1-indexed, meaning 1 is the first retry attempt after the original failure)
   * @returns {Object} action (RETRY, DLQ, DROP), delayMs
   */
  getRetryAction(eventType, currentAttempt) {
    const policyName = this.config.mappings[eventType] || this.config.mappings['default'];
    const policy = this.config.policies[policyName];

    if (!policy) {
      console.warn(`[RetryManager] Unknown policy ${policyName}, falling back to DROP`);
      return { action: 'DROP' };
    }

    if (currentAttempt > policy.maxAttempts) {
      return { action: policy.routeToDlq ? 'DLQ' : 'DROP' };
    }

    // Attempt is 1-indexed. e.g. Attempt 1 uses delaysMs[0].
    // If we exceed the array length, we just use the last delay value for subsequent retries.
    const delayIndex = Math.min(currentAttempt - 1, policy.delaysMs.length - 1);
    const delayMs = policy.delaysMs[delayIndex];

    return {
      action: 'RETRY',
      delayMs,
      policyName
    };
  }
}
