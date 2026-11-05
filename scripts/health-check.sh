#!/bin/sh

set -e

echo "=== Docker Containers ==="
docker compose ps

echo ""
echo "=== Frontend Health ==="
curl -fsS http://localhost/ > /dev/null
echo "Frontend: OK"

echo ""
echo "=== Backend Health ==="
curl -fsS http://localhost/health
echo ""

echo ""
echo "=== Nginx Status ==="
docker compose exec -T nginx wget -qO- http://127.0.0.1/nginx-status

echo ""
echo "=== Health Check Complete ==="