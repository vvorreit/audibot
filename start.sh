#!/bin/bash
cd "$(dirname "$0")"
export $(cat .env.local | grep -v '^#' | grep '=' | sed 's/[[:space:]]*$//' | xargs)
exec node_modules/.bin/next dev -p 3011
