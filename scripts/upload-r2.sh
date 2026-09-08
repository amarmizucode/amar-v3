#!/usr/bin/env bash
#
# Uploads the web-sized photography to Cloudflare R2.
#
# Only the derivatives under `public/assets/photography-web/` and the one local
# portrait are uploaded — these are what browsers actually fetch. The camera
# originals in `public/assets/photography/` stay local: they are the source
# `gen-photography.py` reads, never served, and 4.3 GB of bucket storage that
# would earn nothing.
#
# R2 speaks the S3 API, so this drives the AWS CLI against the R2 endpoint.
# Credentials come from .env (see .env.example) and are never baked in here.
#
# Usage:
#   ./scripts/upload-r2.sh            # upload anything missing or changed
#   ./scripts/upload-r2.sh --dry-run  # list what would be uploaded, change nothing
#
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "error: .env not found. Copy .env.example to .env and fill it in." >&2
  exit 1
fi

# Read .env without executing it: only KEY=VALUE lines, comments skipped.
while IFS='=' read -r key value; do
  [[ $key =~ ^[[:space:]]*# ]] && continue
  [[ -z ${key// /} ]] && continue
  key="${key// /}"
  # Strip surrounding quotes and any trailing comment/whitespace.
  value="${value%\"}"; value="${value#\"}"
  value="${value%\'}"; value="${value#\'}"
  export "$key=$value"
done < .env

: "${R2_ACCOUNT_ID:?set R2_ACCOUNT_ID in .env}"
: "${R2_ACCESS_KEY_ID:?set R2_ACCESS_KEY_ID in .env}"
: "${R2_SECRET_ACCESS_KEY:?set R2_SECRET_ACCESS_KEY in .env}"
: "${R2_BUCKET:?set R2_BUCKET in .env}"

ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# Scoped to this command only, so an existing AWS profile is left alone.
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION=auto
# R2 rejects the streaming checksum trailers newer AWS CLIs send by default.
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required

DRY_RUN=""
[[ ${1:-} == "--dry-run" ]] && DRY_RUN="--dryrun"

# Immutable content: every file is content-addressed by its path, and a changed
# photo gets regenerated under a new name, so a long max-age is safe.
CACHE="public, max-age=31536000, immutable"

echo "bucket:   ${R2_BUCKET}"
echo "endpoint: ${ENDPOINT}"
echo

# `sync` uploads only what is missing or has changed, so re-running after
# adding photos costs one listing rather than a full re-upload.
echo "==> photography-web (resized derivatives)"
aws s3 sync public/assets/photography-web "s3://${R2_BUCKET}/assets/photography-web" \
  --endpoint-url "$ENDPOINT" \
  --cache-control "$CACHE" \
  --exclude "*" --include "*.jpg" \
  --no-progress $DRY_RUN

echo
echo "==> single local images"
aws s3 cp public/assets/amar-ramesh.jpg "s3://${R2_BUCKET}/assets/amar-ramesh.jpg" \
  --endpoint-url "$ENDPOINT" \
  --cache-control "$CACHE" \
  --no-progress $DRY_RUN

echo
if [[ -n $DRY_RUN ]]; then
  echo "dry run — nothing uploaded."
else
  echo "done. Set NEXT_PUBLIC_IMAGE_BASE_URL to the bucket's public URL and rebuild."
fi
