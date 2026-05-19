#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${GITHUB_REF_NAME:-local}"

echo "Laser Welding Skills publish — version: ${VERSION}"

if [[ -z "${SKILLS_MARKETPLACE_TOKEN:-}" ]]; then
  echo "SKILLS_MARKETPLACE_TOKEN not set — skipping marketplace publish (dry-run OK for CI)."
  echo "Would publish skill: laser-welding from ${ROOT}"
  exit 0
fi

# Placeholder for official marketplace API / CLI when available:
# npx skills publish --token "$SKILLS_MARKETPLACE_TOKEN" --skill laser-welding --version "${VERSION#v}"

echo "Marketplace publish placeholder completed."
echo "Configure SKILLS_MARKETPLACE_API_URL when the registry API is live."
