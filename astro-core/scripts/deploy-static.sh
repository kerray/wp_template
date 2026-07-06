#!/usr/bin/env bash
# Deploy a built Astro static site to FTP hosting via lftp mirror.
#
# Generic (no hardcoded domain/paths): all target details come from the site's
# .env. Mirrors the project's existing lftp pattern (mirror -R --only-newer
# --delete --parallel=4).
#
# Usage:
#   just astro-build                    # produces DIST_DIR (default ./astro/dist)
#   bash deploy-static.sh               # prompts before uploading
#   bash deploy-static.sh --yes         # skip the confirmation prompt (CI)
#
# Config (from the site's .env at repo root, or the environment):
#   FTP_HOST          (required)  e.g. ftp.example.com
#   FTP_USER          (required)
#   FTP_PASS          (required)
#   FTP_REMOTE_PATH   (required)  e.g. /domains/example.com/
#   DIST_DIR          (optional)  default: ./astro/dist (relative to repo root)
set -euo pipefail

# Resolve repo root: this script lives at astro-core/scripts/, but is normally
# invoked from the site repo root. Prefer the caller's CWD for .env / DIST_DIR,
# falling back to the script's grandparent.
ROOT="${PWD}"
if [[ ! -f "${ROOT}/.env" && -f "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/.env" ]]; then
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fi

YES=0
for arg in "$@"; do
  case "$arg" in
    --yes|-y) YES=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

# Load .env if present.
if [[ -f "${ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT}/.env"
  set +a
fi

# Compatibility: this repo's older/backend FTP convention (used by
# `just astro-wp-plugin`) names these FTP_PASSWORD / FTP_PATH. Accept them as
# fallbacks so a single .env works for both the WP-backend and static deploys.
: "${FTP_PASS:=${FTP_PASSWORD:-}}"
: "${FTP_REMOTE_PATH:=${FTP_PATH:-}}"

missing=0
for var in FTP_HOST FTP_USER FTP_PASS FTP_REMOTE_PATH; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: ${var} is not set (define it in ${ROOT}/.env or the environment)." >&2
    missing=1
  fi
done
[[ "${missing}" -eq 0 ]] || exit 1

DIST_DIR="${DIST_DIR:-./astro/dist}"
# Make DIST_DIR absolute relative to ROOT if it isn't already.
case "${DIST_DIR}" in
  /*) DIST="${DIST_DIR}" ;;
  *)  DIST="${ROOT}/${DIST_DIR#./}" ;;
esac

if [[ ! -d "${DIST}" ]]; then
  echo "ERROR: ${DIST} not found. Build the site first (e.g. 'just astro-build')." >&2
  exit 1
fi

echo "Deploying ${DIST}  ->  ${FTP_HOST}:${FTP_REMOTE_PATH}"
if [[ "${YES}" -ne 1 ]]; then
  echo "This overwrites the live site root via mirror --delete. Confirm the target is correct."
  read -r -p "Type 'deploy' to continue: " CONFIRM
  [[ "${CONFIRM}" == "deploy" ]] || { echo "Aborted."; exit 1; }
fi

lftp -u "${FTP_USER},${FTP_PASS}" "${FTP_HOST}" <<EOF
set ftp:ssl-allow true
set ssl:verify-certificate no
mirror --reverse --only-newer --delete --parallel=4 \
  --verbose \
  "${DIST}/" "${FTP_REMOTE_PATH}"
bye
EOF

echo "Done."
