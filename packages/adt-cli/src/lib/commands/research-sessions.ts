/**
 * Research command for ADT Sessions endpoint
 * Usage: npx adt research-sessions [options]
 */

import { AdtClientImpl } from '@abapify/adt-client';
import { createCliLogger } from '../utils/logger-config';
import { writeFile } from 'fs/promises';

export interface SessionsResearchOptions {
  verbose?: boolean;
  output?: string;
  format?: 'console' | 'json' | 'xml';
}

interface SessionLink {
  href: string;
  rel: string;
  type?: string;
  title: string;
}

interface SessionData {
  sessionLinks: SessionLink[];
  properties: Record<string, string>;
}

interface ResearchResults {
  mainSession: {
    xml: string;
    parsed: SessionData;
  };
  endpoints: Array<{
    url: string;
    title: string;
    status: number;
    contentType: string;
    data: string;
    error?: string;
  }>;
}

/**
 * Parse sessions XML response
 */
function parseSessionsXml(xml: string): SessionData {
  const sessionLinks: SessionLink[] = [];
  const properties: Record<string, string> = {};

  // Extract atom:link elements with flexible regex
  const linkRegex =
    /<atom:link[^>]*href="([^"]*)"[^>]*rel="([^"]*)"[^>]*(?:type="([^"]*)"[^>]*)?title="([^"]*)"[^>]*\/?>/g;
  let match;

  while ((match = linkRegex.exec(xml)) !== null) {
    sessionLinks.push({
      href: match[1],
      rel: match[2],
      type: match[3] || undefined,
      title: match[4],
    });
  }

  // Extract properties
  const propRegex =
    /<http:property[^>]*name="([^"]*)"[^>]*>([^<]*)<\/http:property>/g;
  while ((match = propRegex.exec(xml)) !== null) {
    properties[match[1]] = match[2];
  }

  return { sessionLinks, properties };
}

/**
 * Format response data for display
 */
function formatResponseData(data: string, contentType: string): string {
  if (data.trim().startsWith('<?xml') || data.trim().startsWith('<')) {
    return `📄 XML Response:\n${data}`;
  } else if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(data);
      return `📄 JSON Response:\n${JSON.stringify(parsed, null, 2)}`;
    } catch {
      return `📄 Text Response:\n${data}`;
    }
  } else {
    return `📄 Text Response:\n${data}`;
  }
}

/**
 * Research ADT sessions endpoint and related endpoints
 */
export async function researchSessions(
  options: SessionsResearchOptions = {}
): Promise<void> {
  const logger = createCliLogger({ verbose: options.verbose });
  const results: ResearchResults = {
    mainSession: { xml: '', parsed: { sessionLinks: [], properties: {} } },
    endpoints: [],
  };

  try {
    logger.info('🧪 Starting ADT Sessions Research');

    // Try to force a fresh authentication session
    logger.info('🔄 Creating fresh ADT client connection...');
    const client = new AdtClientImpl({
      logger: logger?.child({ component: 'research-sessions' }),
    });

    // Force connection establishment (this might trigger fresh auth)
    await client.connect({} as any);

    // 1. Try preflight_logon first (ADT preliminary check)
    logger.info('🚀 Trying preflight_logon call...');
    const timestamp = Date.now();
    const preflightResponse = await client.request(
      `/sap/bc/adt/core/http/sessions?_=${timestamp}`,
      {
        headers: {
          Accept:
            'application/vnd.sap.adt.core.http.session.v3+xml, application/vnd.sap.adt.core.http.session.v2+xml, application/vnd.sap.adt.core.http.session.v1+xml',
          'User-Agent':
            'Eclipse/4.36.0.v20250528-1830 (linux; x86_64; Java 21.0.8) ADT/3.52.0 (research)',
          'sap-adt-purpose': 'preflight_logon',
          'x-sap-security-session': 'create',
        },
      }
    );

    const preflightXml = await preflightResponse.text();
    const preflightParsed = parseSessionsXml(preflightXml);

    console.log('\n🚀 Preflight Logon Response:');
    console.log('='.repeat(50));
    console.log(`Status: ${preflightResponse.status}`);
    console.log(
      `Content-Type: ${
        preflightResponse.headers.get('content-type') || 'unknown'
      }`
    );
    console.log(`Links Found: ${preflightParsed.sessionLinks.length}`);

    preflightParsed.sessionLinks.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.title}`);
      console.log(`     → ${link.href}`);
      console.log(`     → rel: ${link.rel}`);
      if (link.type) console.log(`     → type: ${link.type}`);
      console.log();
    });

    // 2. Research main sessions endpoint (should now be freshly authenticated)
    logger.info('📡 Fetching main sessions endpoint with fresh auth...');
    console.log('🔍 Authentication State: Fresh connection established');
    const mainResponse = await client.request(
      '/sap/bc/adt/core/http/sessions',
      {
        headers: {
          Accept:
            'application/vnd.sap.adt.core.http.session.v3+xml, application/vnd.sap.adt.core.http.session.v2+xml, application/vnd.sap.adt.core.http.session.v1+xml',
          'User-Agent':
            'Eclipse/4.36.0.v20250528-1830 (linux; x86_64; Java 21.0.8) ADT/3.52.0 (research)',
          'X-sap-adt-profiling': 'server-time',
          'sap-adt-purpose': 'logon',
          'sap-adt-saplb': 'fetch',
          'sap-cancel-on-close': 'true',
          'x-sap-security-session': 'create',
        },
      }
    );
    const sessionsXml = await mainResponse.text();

    results.mainSession.xml = sessionsXml;
    results.mainSession.parsed = parseSessionsXml(sessionsXml);

    if (options.format === 'console' || !options.format) {
      console.log('\n🔍 Main Sessions Endpoint Analysis:');
      console.log('='.repeat(50));
      console.log(`Status: ${mainResponse.status}`);
      console.log(
        `Content-Type: ${mainResponse.headers.get('content-type') || 'unknown'}`
      );

      if (options.verbose) {
        console.log('\n📄 Raw XML Response:');
        console.log(sessionsXml);
      }

      console.log('\n🔗 Session Links Found:');
      results.mainSession.parsed.sessionLinks.forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.title}`);
        console.log(`     → ${link.href}`);
        console.log(`     → rel: ${link.rel}`);
        if (link.type) console.log(`     → type: ${link.type}`);
        console.log();
      });

      console.log('⚙️  Session Properties:');
      Object.entries(results.mainSession.parsed.properties).forEach(
        ([key, value]) => {
          const displayValue =
            key === 'inactivityTimeout'
              ? `${value} seconds (${Math.floor(Number(value) / 60)} minutes)`
              : value;
          console.log(`  ${key}: ${displayValue}`);
        }
      );
    }

    // 2. Compare with existing session query (no fresh auth)
    logger.info('🔍 Comparing with existing session query...');
    try {
      const existingClient = new AdtClientImpl({
        logger: logger?.child({ component: 'existing-session' }),
      });

      const existingResponse = await existingClient.request(
        '/sap/bc/adt/core/http/sessions',
        {
          headers: {
            Accept: 'application/vnd.sap.adt.core.http.session.v3+xml',
            'sap-adt-purpose': 'query', // Different purpose - just querying
            'x-sap-security-session': 'use', // Use existing, don't create
          },
        }
      );

      const existingXml = await existingResponse.text();
      const existingParsed = parseSessionsXml(existingXml);

      console.log('\n📊 Comparison Results:');
      console.log('='.repeat(50));
      console.log(
        `Fresh Auth Links: ${results.mainSession.parsed.sessionLinks.length}`
      );
      console.log(
        `Existing Session Links: ${existingParsed.sessionLinks.length}`
      );

      if (
        results.mainSession.parsed.sessionLinks.length !==
        existingParsed.sessionLinks.length
      ) {
        console.log(
          '🎯 DIFFERENCE DETECTED! Fresh auth returned different results!'
        );
      } else {
        console.log('⚠️  Same number of links returned');
      }
    } catch (error: any) {
      console.error('❌ Existing session query failed:', error.message);
    }

    // 3. Try CSRF token fetch call (different purpose)
    logger.info('🔍 Trying CSRF token fetch call...');
    try {
      const csrfResponse = await client.request(
        '/sap/bc/adt/core/http/sessions',
        {
          headers: {
            Accept: '*/*',
            'User-Agent':
              'Eclipse/4.36.0.v20250528-1830 (linux; x86_64; Java 21.0.8) ADT/3.52.0 (research)',
            'X-sap-adt-profiling': 'server-time',
            'sap-adt-purpose': 'fetch-csrf-token',
            'sap-adt-saplb': 'fetch',
            'sap-cancel-on-close': 'true',
            'x-csrf-token': 'fetch',
            'x-sap-security-session': 'use',
          },
        }
      );

      const csrfXml = await csrfResponse.text();
      console.log('\n🔑 CSRF Token Fetch Response:');
      console.log('='.repeat(50));
      console.log(`Status: ${csrfResponse.status}`);
      console.log(
        `Content-Type: ${csrfResponse.headers.get('content-type') || 'unknown'}`
      );

      // Check for CSRF token in response headers
      const csrfToken = csrfResponse.headers.get('x-csrf-token');
      if (csrfToken) {
        console.log(`🎯 CSRF Token: ${csrfToken}`);
      }

      if (options.verbose) {
        console.log('\n📄 CSRF Response Body:');
        console.log(csrfXml);
      }

      // Parse this response too
      const csrfParsed = parseSessionsXml(csrfXml);
      console.log('\n🔗 CSRF Session Links Found:');
      csrfParsed.sessionLinks.forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.title}`);
        console.log(`     → ${link.href}`);
        console.log(`     → rel: ${link.rel}`);
        if (link.type) console.log(`     → type: ${link.type}`);
        console.log();
      });
    } catch (error: any) {
      console.error('❌ CSRF token fetch failed:', error.message);
    }

    // 4. Research each discovered endpoint
    logger.info('🔍 Researching discovered endpoints...');

    for (const link of results.mainSession.parsed.sessionLinks) {
      try {
        if (options.format === 'console' || !options.format) {
          console.log(`\n📍 Researching: ${link.title}`);
          console.log(`🌐 GET ${link.href}`);
        }

        // Determine appropriate headers based on endpoint
        const headers: Record<string, string> = {};

        if (link.href.includes('/sessions/')) {
          // Security session endpoint
          headers['Accept'] =
            'application/vnd.sap.adt.core.http.session.v3+xml';
        } else if (link.href.includes('systeminformation')) {
          // System information endpoint
          headers['Accept'] =
            'application/vnd.sap.adt.core.http.systeminformation.v1+json';
        } else {
          // Default for other endpoints
          headers['Accept'] = 'application/xml,text/html,*/*';
        }

        const linkResponse = await client.request(link.href, { headers });
        const linkData = await linkResponse.text();

        const endpointResult = {
          url: link.href,
          title: link.title,
          status: linkResponse.status,
          contentType: linkResponse.headers.get('content-type') || 'unknown',
          data: linkData,
        };

        results.endpoints.push(endpointResult);

        if (options.format === 'console' || !options.format) {
          console.log(`✅ Status: ${linkResponse.status}`);
          console.log(`📦 Content-Type: ${endpointResult.contentType}`);

          if (options.verbose) {
            console.log(
              formatResponseData(linkData, endpointResult.contentType)
            );
          } else {
            // Show truncated response
            const preview =
              linkData.length > 300
                ? linkData.substring(0, 300) + '...'
                : linkData;
            console.log(`📄 Response Preview:\n${preview}`);
          }
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        const errorResult = {
          url: link.href,
          title: link.title,
          status: error.context?.status || 0,
          contentType: 'error',
          data: '',
          error: error.message,
        };

        results.endpoints.push(errorResult);

        if (options.format === 'console' || !options.format) {
          console.error(`❌ Failed to research ${link.href}: ${error.message}`);
          if (error.context?.status) {
            console.error(`   Status: ${error.context.status}`);
          }
        }
      }
    }

    // 3. Output results
    if (options.output) {
      let outputContent: string;

      if (options.format === 'json') {
        outputContent = JSON.stringify(results, null, 2);
      } else if (options.format === 'xml') {
        outputContent = results.mainSession.xml;
      } else {
        // Default: human-readable format
        outputContent = generateReportContent(results);
      }

      await writeFile(options.output, outputContent, 'utf-8');
      logger.info(`📁 Results saved to: ${options.output}`);
    }

    if (options.format === 'console' || !options.format) {
      console.log('\n🎉 Sessions research complete!');
      console.log('\n💡 Key Findings:');
      console.log(
        '• Session endpoint provides security URLs, logoff links, and system info'
      );
      console.log(
        '• Security session URLs contain session-specific authentication data'
      );
      console.log('• System information provides JSON system metadata');
      console.log(
        `• Session timeout: ${
          results.mainSession.parsed.properties.inactivityTimeout || 'unknown'
        } seconds`
      );
    }
  } catch (error: any) {
    logger.error('💥 Sessions research failed:', error.message);
    if (error.context) {
      logger.error('Response:', error.context.response);
    }
    throw error;
  }
}

/**
 * Generate human-readable report content
 */
function generateReportContent(results: ResearchResults): string {
  const report = [
    '# ADT Sessions Endpoint Research Report',
    '='.repeat(50),
    '',
    '## Main Sessions Endpoint',
    `URL: /sap/bc/adt/core/http/sessions`,
    '',
    '### Session Properties:',
    ...Object.entries(results.mainSession.parsed.properties).map(
      ([key, value]) => `- ${key}: ${value}`
    ),
    '',
    '### Discovered Endpoints:',
    ...results.mainSession.parsed.sessionLinks.map(
      (link, i) =>
        `${i + 1}. **${link.title}**\n   - URL: ${
          link.href
        }\n   - Relationship: ${link.rel}\n   - Type: ${link.type || 'N/A'}`
    ),
    '',
    '## Endpoint Research Results',
    '',
    ...results.endpoints.map((endpoint) =>
      [
        `### ${endpoint.title}`,
        `- URL: ${endpoint.url}`,
        `- Status: ${endpoint.status}`,
        `- Content-Type: ${endpoint.contentType}`,
        endpoint.error ? `- Error: ${endpoint.error}` : '',
        endpoint.data && !endpoint.error
          ? `- Response Length: ${endpoint.data.length} characters`
          : '',
        '',
      ]
        .filter((line) => line !== '')
        .join('\n')
    ),
    '',
    '## Summary',
    'This report documents the ADT sessions endpoint and its related resources.',
    'The sessions endpoint provides essential session management information for ADT clients.',
  ];

  return report.join('\n');
}

export default researchSessions;
