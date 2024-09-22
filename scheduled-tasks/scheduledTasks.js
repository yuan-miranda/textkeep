// scheduled-tasks/scheduledTasks.js
const cron = require('node-cron');
const { cleanup } = require('../utils/cleanup');

/**
 * Runs the cleanup function every day at midnight.
 */
cron.schedule('0 0 * * *', async () => {
    console.log("Running scheduled cleanup tasks...");
    await cleanup();
});