/**
 * Detects whether the process is running inside a GitHub Codespace.
 * When it is, ports cannot be reached at `localhost` from the browser;
 * they must be accessed via the forwarded-port URL provided by Codespaces.
 *
 * @see https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace
 */
export function getCallbackBaseUrl(port: number): string {
  const codespaceName = process.env['CODESPACE_NAME'];
  const forwardingDomain =
    process.env['GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN'];

  if (codespaceName && forwardingDomain) {
    return `https://${codespaceName}-${port}.${forwardingDomain}`;
  }

  return `http://localhost:${port}`;
}
