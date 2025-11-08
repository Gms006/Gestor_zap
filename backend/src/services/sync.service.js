import cron from 'node-cron';
import logger from '../utils/logger.utils.js';

let scheduledJob;

export function scheduleIncrementalSync(callback) {
  const frequency = process.env.SYNC_FREQUENCY || '*/15 * * * *';

  if (scheduledJob) {
    scheduledJob.stop();
  }

  scheduledJob = cron.schedule(frequency, async () => {
    logger.info('Running scheduled incremental sync');
    if (callback) {
      await callback();
    }
  });

  logger.info('Incremental sync scheduled', { frequency });
}

export async function runInitialSync(handler) {
  const startDate = process.env.SYNC_START_DATE || '2025-11-01';
  logger.info('Running initial sync', { startDate });
  if (handler) {
    await handler({ startDate });
  }
}
