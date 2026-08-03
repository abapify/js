import { Command } from 'commander';
import { ctsTaskCreateCommand } from './create';

export function createTaskCommand(): Command {
  const task = new Command('task').description('Transport task operations');
  task.addCommand(ctsTaskCreateCommand);
  return task;
}
