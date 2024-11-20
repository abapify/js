import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const execAsync = promisify(exec);

export const getOAuthToken = async (): Promise<string> => {
  const { stdout, stderr } = await execAsync('cf oauth-token');
  if (stderr) {
    throw new Error(stderr);
  }
  return stdout.trim();
};
