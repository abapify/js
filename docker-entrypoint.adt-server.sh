#!/bin/sh
set -eu

# Compose file-backed secrets retain the host file's ownership. Read the
# broker token while this entrypoint is root, then hand a private copy to the
# unprivileged server process. The token is never written to a log or image
# layer.
if [ -n "${ADT_SERVER_BROKER_TOKEN_FILE:-}" ] && [ -s "$ADT_SERVER_BROKER_TOKEN_FILE" ]; then
  install -o appuser -g appuser -m 0600 "$ADT_SERVER_BROKER_TOKEN_FILE" /tmp/adt-server-broker-token
  export ADT_SERVER_BROKER_TOKEN_FILE=/tmp/adt-server-broker-token
fi

# MCP is opt-in in local Compose. When disabled, remove every invocation
# setting before the application starts. When enabled, copy only the public
# verification key for the unprivileged process; a private signing key is
# neither mounted nor accepted by the runtime configuration.
case "${ADT_SERVER_MCP_ENABLED:-false}" in
  false)
    unset ADT_SERVER_MCP_PUBLIC_KEY_FILE ADT_SERVER_MCP_KEY_ID ADT_SERVER_MCP_ISSUER ADT_SERVER_MCP_ALLOWED_HOSTS
    ;;
  true)
    if [ -z "${ADT_SERVER_MCP_PUBLIC_KEY_FILE:-}" ] || [ ! -s "$ADT_SERVER_MCP_PUBLIC_KEY_FILE" ]; then
      echo "ADT Server MCP public key is required when MCP is enabled" >&2
      exit 1
    fi
    install -o appuser -g appuser -m 0444 "$ADT_SERVER_MCP_PUBLIC_KEY_FILE" /tmp/adt-server-mcp-public-key
    export ADT_SERVER_MCP_PUBLIC_KEY_FILE=/tmp/adt-server-mcp-public-key
    ;;
  *)
    echo "ADT_SERVER_MCP_ENABLED must be true or false" >&2
    exit 1
    ;;
esac

exec setpriv --reuid=appuser --regid=appuser --init-groups "$@"
