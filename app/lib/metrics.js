const { Counter, register, collectDefaultMetrics } = require('prom-client');

const submissionsCounter = new Counter({
  name: 'submissions_total',
  help: 'Number of submissions',
  labelNames: ['category', 'status'],
});

collectDefaultMetrics(register);

module.exports = { register, submissionsCounter };
