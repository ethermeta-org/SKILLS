#!/usr/bin/env bash
# Publish @ethermeta/lasernexus-core and/or @ethermeta/lasernexus to npmjs.org.
#
# Auth (use ONE method — do not mix login + token):
#   export NPM_TOKEN=npm_...   # granular token, bypass 2FA, write @ethermeta
#   ./scripts/publish-npm.sh
#   (script writes .npmrc from NPM_TOKEN; run `npm logout` first if you used npm login)
#
#   Or: npm login + npm publish --otp=123456  (no NPM_TOKEN)
#
# Usage:
#   ./scripts/publish-npm.sh [--dry-run] [--skip-checks] [--check-versions]
#   ./scripts/publish-npm.sh --core [--dry-run] [--skip-checks] [--check-versions]
#   ./scripts/publish-npm.sh --mcp [--dry-run] [--skip-checks] [--check-versions]
#   ./scripts/publish-npm.sh --lasernexus   # alias for --mcp
#
# Publish only one package (default: both, core first):
#   --core        @ethermeta/lasernexus-core only
#   --mcp         @ethermeta/lasernexus only (--lasernexus is an alias)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DRY_RUN=false
SKIP_CHECKS=false
CHECK_VERSIONS_ONLY=false
PUBLISH_TARGET="all" # all | core | mcp
WANT_CORE=false
WANT_MCP=false
VERSION_WARNINGS=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --skip-checks) SKIP_CHECKS=true ;;
    --check-versions) CHECK_VERSIONS_ONLY=true ;;
    --core) WANT_CORE=true ;;
    --mcp|--lasernexus) WANT_MCP=true ;;
    -h|--help)
      cat <<EOF
Usage: $0 [TARGET] [OPTIONS]

TARGET (optional, default: publish both packages):
  (none)          Publish @ethermeta/lasernexus-core then @ethermeta/lasernexus
  --core          Publish @ethermeta/lasernexus-core only
  --mcp           Publish @ethermeta/lasernexus only
  --lasernexus    Alias for --mcp

OPTIONS:
  --dry-run         Run checks and npm publish --dry-run (no upload)
  --skip-checks     Skip lint/test; still runs build for selected package(s)
  --check-versions  Verify versions (and MCP->core dep); exit without publishing
  -h, --help        Show this help

Examples:
  $0 --check-versions
  $0 --core --dry-run
  $0 --mcp
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Run $0 --help" >&2
      exit 1
      ;;
  esac
done

if [[ "$WANT_CORE" == true && "$WANT_MCP" == true ]]; then
  echo "ERROR: Use only one of --core or --mcp/--lasernexus." >&2
  exit 1
fi
if [[ "$WANT_CORE" == true ]]; then
  PUBLISH_TARGET="core"
elif [[ "$WANT_MCP" == true ]]; then
  PUBLISH_TARGET="mcp"
fi

CORE_PKG="$ROOT/packages/laser-welding-core/package.json"
MCP_PKG="$ROOT/mcp/lasernexus/package.json"
CORE_WS="@ethermeta/lasernexus-core"
MCP_WS="@ethermeta/lasernexus"

core_version() {
  node -e "console.log(require('$CORE_PKG').version)"
}

mcp_version() {
  node -e "console.log(require('$MCP_PKG').version)"
}

mcp_core_dep() {
  node -e "console.log(require('$MCP_PKG').dependencies['@ethermeta/lasernexus-core'])"
}

check_versions() {
  local core_ver mcp_ver dep_ver
  core_ver="$(core_version)"
  mcp_ver="$(mcp_version)"
  dep_ver="$(mcp_core_dep)"

  echo "Versions: core=$core_ver mcp=$mcp_ver mcp->core dep=$dep_ver"
  echo "Publish target: $PUBLISH_TARGET"

  if [[ "$dep_ver" != "$core_ver" ]]; then
    if [[ "$PUBLISH_TARGET" == "core" ]]; then
      VERSION_WARNINGS=true
      echo "WARN: @ethermeta/lasernexus depends on @ethermeta/lasernexus-core@$dep_ver but core package.json is $core_ver." >&2
      echo "WARN: Update mcp/lasernexus/package.json before publishing MCP." >&2
    else
      echo "ERROR: @ethermeta/lasernexus must depend on @ethermeta/lasernexus-core@$core_ver (got $dep_ver)" >&2
      exit 1
    fi
  fi
}

run_checks() {
  if [[ "$SKIP_CHECKS" == true ]]; then
    echo "Skipping lint and test (--skip-checks)."
    rm -rf packages/laser-welding-core/dist mcp/lasernexus/dist
    case "$PUBLISH_TARGET" in
      core) npm run build -w "$CORE_WS" ;;
      mcp)
        npm run build -w "$CORE_WS"
        npm run build -w "$MCP_WS"
        ;;
      all) npm run build ;;
    esac
    return
  fi

  npm ci
  case "$PUBLISH_TARGET" in
    core)
      npm run lint -w "$CORE_WS"
      npm run build -w "$CORE_WS"
      npm test -w "$CORE_WS"
      ;;
    mcp)
      npm run lint -w "$CORE_WS"
      npm run lint -w "$MCP_WS"
      npm run build -w "$CORE_WS"
      npm run build -w "$MCP_WS"
      npm test -w "$MCP_WS"
      ;;
    all)
      npm run lint
      npm run build
      npm test
      ;;
  esac
}

publish_package() {
  local ws="$1"
  local ver="$2"
  echo "Publishing $ws@$ver..."
  npm publish --registry=https://registry.npmjs.org/ -w "$ws" "${PUBLISH_ARGS[@]}"
}

check_versions

if [[ "$CHECK_VERSIONS_ONLY" == true ]]; then
  if [[ "$VERSION_WARNINGS" == true ]]; then
    echo "Version check completed with warnings."
    exit 0
  fi
  echo "Version check passed."
  exit 0
fi

node_major="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$node_major" -lt 20 ]]; then
  echo "ERROR: Node.js 20+ required (got $(node -v))" >&2
  exit 1
fi

NPMRC_PROJECT="$ROOT/.npmrc"
AUTH_MODE="login"

if [[ -n "${NPM_TOKEN:-}" ]]; then
  export NODE_AUTH_TOKEN="${NODE_AUTH_TOKEN:-$NPM_TOKEN}"
  AUTH_MODE="token"
  cat > "$NPMRC_PROJECT" <<EOF
//registry.npmjs.org/:_authToken=\${NPM_TOKEN}
registry=https://registry.npmjs.org/
EOF
  echo "Auth: NPM_TOKEN → $NPMRC_PROJECT (granular / bypass-2FA token)"
  echo "Tip: if publish still asks for 2FA, run: npm logout"
elif [[ -f "$HOME/.npmrc" ]] && grep -q '_authToken' "$HOME/.npmrc" 2>/dev/null; then
  echo "Auth: ~/.npmrc (npm login session — may require --otp on publish)"
  echo "Tip: for automation tokens, export NPM_TOKEN and run: npm logout"
fi

if ! npm whoami &>/dev/null; then
  echo "ERROR: Not authenticated. Set NPM_TOKEN or run npm login." >&2
  exit 1
fi
echo "Publishing as: $(npm whoami) (auth=$AUTH_MODE)"
echo "Registry: https://registry.npmjs.org"
echo "Dry run: $DRY_RUN"
echo "Target: $PUBLISH_TARGET"

PUBLISH_ARGS=(--access public)
if [[ "$DRY_RUN" == true ]]; then
  PUBLISH_ARGS+=(--dry-run)
fi

run_checks

PUBLISHED=()
case "$PUBLISH_TARGET" in
  core)
    publish_package "$CORE_WS" "$(core_version)"
    PUBLISHED+=("$CORE_WS@$(core_version)")
    ;;
  mcp)
    publish_package "$MCP_WS" "$(mcp_version)"
    PUBLISHED+=("$MCP_WS@$(mcp_version)")
    ;;
  all)
    publish_package "$CORE_WS" "$(core_version)"
    PUBLISHED+=("$CORE_WS@$(core_version)")
    publish_package "$MCP_WS" "$(mcp_version)"
    PUBLISHED+=("$MCP_WS@$(mcp_version)")
    ;;
esac

if [[ "$DRY_RUN" == true ]]; then
  echo "Dry run complete. No packages were uploaded."
else
  echo "Published ${PUBLISHED[*]}."
fi
