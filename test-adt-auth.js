#!/usr/bin/env node

const { readFileSync } = require('fs');
const {
  discovery,
  buildAuthorizationUrl,
  authorizationCodeGrant,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  randomState,
  Configuration,
} = require('openid-client');
const express = require('express');
const open = require('open');

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

    // Create manual issuer configuration (UAA may not support OpenID discovery)
    console.log('\n🔧 Setting up OAuth endpoints...');
    const issuerConfig = new Configuration({
      issuer: serviceKey.uaa.url,
      authorization_endpoint: `${serviceKey.uaa.url}/oauth/authorize`,
      token_endpoint: `${serviceKey.uaa.url}/oauth/token`,
      userinfo_endpoint: `${serviceKey.uaa.url}/userinfo`,
    });
    console.log('✅ OAuth endpoints configured');
    console.log(
      '   Authorization endpoint:',
      issuerConfig.authorization_endpoint
    );
    console.log('   Token endpoint:', issuerConfig.token_endpoint);

    // Generate PKCE parameters
    const code_verifier = randomPKCECodeVerifier();
    const code_challenge = await calculatePKCECodeChallenge(code_verifier);
    const state = randomState();

    // Create authorization URL
    const authUrl = buildAuthorizationUrl(issuerConfig, {
      client_id: serviceKey.uaa.clientid,
      redirect_uri: 'http://localhost:3000/callback',
      scope: 'openid profile',
      response_type: 'code',
      code_challenge,
      code_challenge_method: 'S256',
      state,
    });

    console.log('\n🌐 Opening browser for authentication...');
    console.log('   Auth URL:', authUrl);

    // Set up callback server
    const app = express();
    let server;

    const authPromise = new Promise((resolve, reject) => {
      app.get('/callback', async (req, res) => {
        try {
          console.log('\n📥 Received callback');
          console.log('   Code:', req.query.code ? 'Present' : 'Missing');
          console.log('   State:', req.query.state || 'None');

          // Exchange code for tokens
          const tokenSet = await authorizationCodeGrant(issuerConfig, {
            client_id: serviceKey.uaa.clientid,
            client_secret: serviceKey.uaa.clientsecret,
            code: req.query.code,
            redirect_uri: 'http://localhost:3000/callback',
            code_verifier,
          });

          console.log('\n✅ Token exchange successful');
          console.log(
            '   Access token:',
            tokenSet.access_token ? 'Present' : 'Missing'
          );
          console.log(
            '   ID token:',
            tokenSet.id_token ? 'Present' : 'Missing'
          );
          console.log(
            '   Refresh token:',
            tokenSet.refresh_token ? 'Present' : 'Missing'
          );
          console.log('   Expires in:', tokenSet.expires_in, 'seconds');

          res.send(`
            <html>
              <body>
                <h2>✅ Authentication Successful!</h2>
                <p>You can close this window and return to the terminal.</p>
                <script>setTimeout(() => window.close(), 2000);</script>
              </body>
            </html>
          `);

          server.close();
          resolve(tokenSet);
        } catch (error) {
          console.error('❌ Token exchange failed:', error.message);
          res.send(`
            <html>
              <body>
                <h2>❌ Authentication Failed</h2>
                <p>Error: ${error.message}</p>
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
        open(authUrl).catch((err) => {
          console.log('⚠️  Could not open browser automatically');
          console.log('   Please open this URL manually:', authUrl);
        });
      });

      // Timeout after 5 minutes
      setTimeout(() => {
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
        Accept: 'application/xml',
        'User-Agent': 'ADT-CLI/1.0.0',
      },
    });

    console.log(
      `📊 Discovery response: ${response.status} ${response.statusText}`
    );

    if (response.ok) {
      console.log('🎉 SUCCESS! ADT discovery works with authenticated tokens');
      const xmlContent = await response.text();
      console.log('\n📋 ADT Discovery Response:');
      console.log('='.repeat(50));
      console.log(
        xmlContent.substring(0, 1000) + (xmlContent.length > 1000 ? '...' : '')
      );
    } else {
      console.log('❌ Still getting authentication error');
      const errorBody = await response.text();
      console.log('Error:', errorBody.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testADTAuth().catch(console.error);
