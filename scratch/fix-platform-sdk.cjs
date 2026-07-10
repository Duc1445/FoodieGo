const fs = require('fs');

// Fix platform-sdk index.js
let sdkIndex = 'packages/platform-sdk/index.js';
fs.writeFileSync(sdkIndex, `export * as logging from '@foodiego/logging';
export * as metrics from '@foodiego/metrics';
export * as tracing from '@foodiego/tracing';
export * as rabbit from '@foodiego/rabbit';
export * as core from '@foodiego/core';
`);

// Fix platform-sdk package.json
let sdkPkg = 'packages/platform-sdk/package.json';
let d = JSON.parse(fs.readFileSync(sdkPkg));
d.dependencies = {
    "@foodiego/logging": "workspace:*",
    "@foodiego/metrics": "workspace:*",
    "@foodiego/tracing": "workspace:*",
    "@foodiego/rabbit": "workspace:*",
    "@foodiego/core": "workspace:*"
};
fs.writeFileSync(sdkPkg, JSON.stringify(d, null, 2));

// Add @opentelemetry/api to order-service
let orderPkg = 'apps/order-service/package.json';
let orderD = JSON.parse(fs.readFileSync(orderPkg));
orderD.dependencies['@opentelemetry/api'] = '^1.9.1';
fs.writeFileSync(orderPkg, JSON.stringify(orderD, null, 2));

console.log('Fixed platform-sdk and order-service dependencies!');
