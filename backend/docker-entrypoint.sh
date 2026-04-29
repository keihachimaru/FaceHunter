#!/bin/sh
set -e

# Validate required env vars at runtime
if [ -z "$MONGODB_URI" ]; then
  echo "FATAL: MONGODB_URI is required"
  exit 1
fi
if [ -z "$JWT_SECRET" ]; then
  echo "FATAL: JWT_SECRET is required"
  exit 1
fi
if [ -z "$Jwt_SECRET" ]; then
  echo "WARN: Jwt_SECRET not set (code reads both casings)"
  export Jwt_SECRET="${JWT_SECRET}"
fi

exec node dist/main
