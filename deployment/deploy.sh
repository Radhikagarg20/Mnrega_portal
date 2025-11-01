set -e

PROJECT_DIR=/var/www/mgnrega-maharashtra-advanced
echo "Deploy script — PROJECT_DIR=${PROJECT_DIR}"

GREEN='\033[0;32m'
NC='\033[0m' 

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: PROJECT_DIR does not exist: $PROJECT_DIR"
  exit 1
fi

echo "📦 Installing backend dependencies (production)..."
cd "$PROJECT_DIR/backend"
npm ci --only=production

echo "🔄 Restarting backend service with PM2..."
pm2 restart mgnrega-maharashtra-api || pm2 start "$PROJECT_DIR/deployment/ecosystem.config.js"

echo "♻️  Restarting Nginx..."
sudo systemctl restart nginx || echo "nginx restart failed - check sudo permissions"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "🌐 Application should be running"
echo "📊 Monitor logs: pm2 logs mgnrega-maharashtra-api"
