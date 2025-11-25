import { Command } from 'commander';
import {
  loadAuthSession,
  getDefaultSid,
} from '../../utils/auth';
import {
  handleCommandError,
} from '../../utils/command-helpers';

export const statusCommand = new Command('status')
  .description('Check authentication status')
  .option('--sid <sid>', 'System ID to check (defaults to current default)')
  .action(async (options) => {
    try {
      const sid = options.sid || getDefaultSid();

      if (!sid) {
        console.log('❌ Not authenticated');
        console.log('💡 Run "npx adt auth login" to login');
        process.exit(1);
      }

      // Try to load session
      const session = loadAuthSession(sid);

      if (!session) {
        console.log(`❌ Not authenticated for SID: ${sid}`);
        console.log(`💡 Run "npx adt auth login --sid=${sid}" to login`);
        process.exit(1);
      }

      console.log('✅ Authenticated');
      console.log('');

      // Show SID
      console.log(`🆔 System: ${sid}`);

      // Show auth type
      const authTypeDisplay =
        session.authType === 'oauth' ? 'OAuth (BTP)' :
        session.authType === 'puppeteer' ? 'Browser (Puppeteer)' :
        'Basic Auth';
      console.log(`🔐 Auth Type: ${authTypeDisplay}`);

      // Show system info based on auth type
      if (session.authType === 'basic' && session.basicAuth) {
        console.log(`🌐 Host: ${session.basicAuth.host}`);
        console.log(`👤 User: ${session.basicAuth.username}`);
        if (session.basicAuth.client) {
          console.log(`🔧 Client: ${session.basicAuth.client}`);
        }
      } else if (session.authType === 'puppeteer' && session.puppeteerAuth) {
        console.log(`🌐 Host: ${session.puppeteerAuth.host}`);
        if (session.puppeteerAuth.client) {
          console.log(`🔧 Client: ${session.puppeteerAuth.client}`);
        }

        // Show token expiration
        const expiresAt = new Date(session.puppeteerAuth.tokenExpiresAt);
        const now = new Date();
        const isExpired = expiresAt <= now;

        console.log('');
        console.log('⏱️  Session Status:');

        if (isExpired) {
          console.log('   Status: ⚠️  Expired (re-authenticate with "npx adt auth login")');
          console.log(`   Expired: ${formatDate(expiresAt)}`);
        } else {
          const timeLeft = expiresAt.getTime() - now.getTime();
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

          console.log(`   Status: ✅ Valid`);
          console.log(`   Expires: ${formatDate(expiresAt)}`);
          console.log(`   Time left: ${hoursLeft}h ${minutesLeft}m`);
        }
      }

    } catch (error) {
      handleCommandError(error, 'Status');
    }
  });

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

