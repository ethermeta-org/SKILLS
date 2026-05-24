#!/usr/bin/env bash
# Install laser-welding skills for Cursor local plugins.
# Cursor rejects symlinks whose target is outside ~/.cursor/plugins/local/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${HOME}/.cursor/plugins/local/laser-welding-skills"
MODE="${1:-copy}"

install_copy() {
  rm -rf "${DEST}"
  mkdir -p "${DEST}"
  cp -R "${ROOT}/.cursor-plugin" "${ROOT}/skills" "${DEST}/"
  echo "Installed to ${DEST} (copy). Quit Cursor (Cmd+Q) and reopen."
}

install_clone() {
  rm -rf "${DEST}"
  git clone "${ROOT}" "${DEST}"
  echo "Cloned to ${DEST}. Quit Cursor (Cmd+Q) and reopen."
}

install_project_skills() {
  mkdir -p "${ROOT}/.cursor/skills"
  for skill_dir in "${ROOT}"/skills/*/; do
    name="$(basename "${skill_dir}")"
    target="../../skills/${name}"
    ln -sfn "${target}" "${ROOT}/.cursor/skills/${name}"
  done
  echo "Project skills linked under ${ROOT}/.cursor/skills/"
  echo "Open this repository in Cursor to use skills in any workspace tab."
}

case "${MODE}" in
  copy)
    install_copy
  ;;
  clone)
    install_clone
  ;;
  project)
    install_project_skills
  ;;
  all)
    install_project_skills
    install_copy
  ;;
  *)
    echo "Usage: $0 [copy|clone|project|all]" >&2
    echo "  copy    — rsync plugin files to ~/.cursor/plugins/local/ (default)" >&2
    echo "  clone   — git clone repo into ~/.cursor/plugins/local/" >&2
    echo "  project — link skills/ into .cursor/skills/ for this repo workspace" >&2
    echo "  all     — project + copy" >&2
    exit 1
  ;;
esac
