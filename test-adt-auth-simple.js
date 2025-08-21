#!/usr/bin/env node

const { readFileSync } = require('fs');
const express = require('express');
const { default: open } = require('open');
const crypto = require('crypto');

// Simple OAuth PKCE utilities
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

async function testADTAuth() {
  try {
    // Read service key
    const serviceKeyJson = readFileSync('./secrets/abap.json', 'utf8');
    const serviceKey = JSON.parse(serviceKeyJson);

    console.log('📄 Service Key loaded');
    console.log('🔧 System ID:', serviceKey.systemid);
    console.log(
      '🌐 ABAP Endpoint:',
      serviceKey.endpoints.abap || serviceKey.url
    );
    console.log('🔐 UAA URL:', serviceKey.uaa.url);

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    console.log('\n🔧 Generated PKCE parameters');
    console.log('   Code verifier:', codeVerifier.substring(0, 20) + '...');
    console.log('   Code challenge:', codeChallenge.substring(0, 20) + '...');
    console.log('   State:', state);

    // Build authorization URL manually
    const authUrl = new URL(`${serviceKey.uaa.url}/oauth/authorize`);
    authUrl.searchParams.set('client_id', serviceKey.uaa.clientid);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/callback');
    // Try without scope first, or use the scope from the existing token
    // From the service key, the token has scope "uaa.resource"
    // authUrl.searchParams.set('scope', 'uaa.resource');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);

    console.log('\n🌐 Opening browser for authentication...');
    console.log('   Auth URL:', authUrl.toString());

    // Set up callback server
    const app = express();
    let server;

    const authPromise = new Promise((resolve, reject) => {
      app.get('/callback', async (req, res) => {
        try {
          console.log('\n📥 Received callback');
          console.log('   Code:', req.query.code ? 'Present' : 'Missing');
          console.log('   State:', req.query.state || 'None');
          console.log('   Error:', req.query.error || 'None');

          if (req.query.error) {
            throw new Error(
              `OAuth error: ${req.query.error} - ${req.query.error_description}`
            );
          }

          if (req.query.state !== state) {
            throw new Error('State mismatch - possible CSRF attack');
          }

          if (!req.query.code) {
            throw new Error('No authorization code received');
          }

          // Exchange code for tokens manually
          console.log('\n🔄 Exchanging code for tokens...');
          const tokenResponse = await fetch(
            `${serviceKey.uaa.url}/oauth/token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(
                  `${serviceKey.uaa.clientid}:${serviceKey.uaa.clientsecret}`
                ).toString('base64')}`,
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: 'http://localhost:3000/callback',
                code_verifier: codeVerifier,
              }),
            }
          );

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(
              `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`
            );
          }

          const tokenSet = await tokenResponse.json();

          console.log('\n✅ Token exchange successful');
          console.log(
            '   Access token:',
            tokenSet.access_token ? 'Present' : 'Missing'
          );
          console.log('   Token type:', tokenSet.token_type);
          console.log('   Expires in:', tokenSet.expires_in, 'seconds');
          console.log('   Scope:', tokenSet.scope || 'None');

          res.send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>✅ Authentication Successful!</h2>
                <p>You can close this window and return to the terminal.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);

          setTimeout(() => {
            server.close();
            resolve(tokenSet);
          }, 1000);
        } catch (error) {
          console.error('❌ Token exchange failed:', error.message);
          res.send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>❌ Authentication Failed</h2>
                <p>Error: ${error.message}</p>
                <p>Check the terminal for more details.</p>
              </body>
            </html>
          `);
          server.close();
          reject(error);
        }
      });

      server = app.listen(3000, () => {
        console.log('🎧 Callback server listening on http://localhost:3000');

        // Open browser
        open(authUrl.toString()).catch((err) => {
          console.log('⚠️  Could not open browser automatically');
          console.log('   Please open this URL manually:', authUrl.toString());
        });
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        console.log('\n⏰ Authentication timed out after 5 minutes');
        server.close();
        reject(new Error('Authentication timed out'));
      }, 300000);
    });

    // Wait for authentication
    const tokenSet = await authPromise;

    // Test ADT discovery with the new tokens
    console.log('\n🔍 Testing ADT discovery with authenticated tokens...');
    const abapEndpoint = serviceKey.endpoints.abap || serviceKey.url;
    const discoveryUrl = `${abapEndpoint}/sap/bc/adt/discovery`;

    const response = await fetch(discoveryUrl, {
      headers: {
        Authorization: `Bearer ${tokenSet.access_token}`,
        Accept: 'application/atomsvc+xml', // Fixed: server wants atomsvc+xml not xml
        'User-Agent': 'ADT-CLI/1.0.0',
      },
    });

    console.log(
      `📊 Discovery response: ${response.status} ${response.statusText}`
    );
    console.log(
      '📋 Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      console.log(
        '\n🎉 SUCCESS! ADT discovery works with authenticated tokens'
      );
      const xmlContent = await response.text();
      console.log(
        `📄 Received ${xmlContent.length} bytes of ADT discovery XML`
      );
      console.log(
        '✨ This confirms the browser-based OAuth flow works for ADT APIs!'
      );
    } else {
      console.log('\n❌ Still getting authentication error');
      const errorBody = await response.text();
      console.log('❌ Error response:', errorBody.substring(0, 500));

      // Maybe try with session cookies instead
      console.log(
        '\n🍪 Trying to extract session cookies from the auth flow...'
      );
      // This would require a more complex flow to capture cookies from the browser session
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testADTAuth().catch(console.error);
