const fs = require('fs');
const glob = require('glob');

const files = [
    'apps/gateway/Dockerfile',
    'apps/identity-service/Dockerfile',
    'apps/inventory-service/Dockerfile',
    'apps/order-service/Dockerfile',
    'apps/payment-service/Dockerfile',
    'apps/restaurant-service/Dockerfile',
    'apps/web/Dockerfile'
];

for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');
    // For services using `npm install -g pnpm`
    content = content.replace(/npm install -g pnpm(?!@)/g, 'npm install -g pnpm@9');
    // For web using `corepack prepare pnpm@latest --activate`
    content = content.replace(/corepack prepare pnpm@latest --activate/g, 'corepack prepare pnpm@9.15.4 --activate');
    fs.writeFileSync(file, content);
}
console.log('Fixed pnpm version in all Dockerfiles!');
