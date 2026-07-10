const fs = require('fs');

['packages/rabbit', 'apps/inventory-service', 'apps/order-service'].forEach(p => {
    let pkg = p + '/package.json';
    let d = JSON.parse(fs.readFileSync(pkg));
    if(!d.dependencies) d.dependencies = {};
    d.dependencies['@opentelemetry/api'] = '^1.9.1';
    fs.writeFileSync(pkg, JSON.stringify(d, null, 2));
    console.log(`Fixed ${p}`);
});
