import { Command } from 'commander';
import { AuthManager } from '@abapify/adt-client';
import {
  createComponentLogger,
  handleCommandError,
} from '../../utils/command-helpers';

export const statusCommand = new Command('status')
  .description('Check authentication status')
  .action(async (options, command) => {
    try {
      const logger = createComponentLogger(command, 'auth');
      const authManager = new AuthManager(logger);
      
      // Try to load session
      const session = authManager.loadSession();
      
      if (!session) {
        console.log('❌ Not authenticated');
        console.log('💡 Run "adt auth login" to login');
        process.exit(1);
      }
      
      console.log('✅ Authenticated');
      console.log('');
      
      // Show auth type
      console.log(`🔐 Auth Type: ${session.authType === 'oauth' ? 'OAuth (BTP)' : 'Basic Auth'}`);
      
      // Show system info
      if (session.authType === 'oauth' && session.serviceKey) {
        console.log(`🔧 System: ${session.serviceKey.systemid}`);
        const abapEndpoint = session.serviceKey.endpoints?.['abap'] || session.serviceKey.url;
        console.log(`🌐 Endpoint: ${abapEndpoint}`);
      } else if (session.authType === 'basic' && session.basicAuth) {
        console.log(`🌐 Host: ${session.basicAuth.host}`);
        console.log(`👤 User: ${session.basicAuth.username}`);
        if (session.basicAuth.client) {
          console.log(`🔧 Client: ${session.basicAuth.client}`);
        }
      }
      
      // Show current user if available
      if (session.currentUser) {
        console.log(`👤 Current User: ${session.currentUser}`);
      }
      
      // Show token expiration for OAuth
      if (session.authType === 'oauth' && session.token?.expires_at) {
        const expiresAt = new Date(session.token.expires_at);
        const now = new Date();
        const isExpired = expiresAt <= now;
        
        console.log('');
        console.log('⏱️  Token Status:');
        
        if (isExpired) {
          console.log('   Status: ⚠️  Expired (will be refreshed automatically on next use)');
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

