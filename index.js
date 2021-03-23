const task = require('./task-scheduler/tasks/example')

// eslint-disable-next-line no-console
task().catch((error) => console.log(error))
