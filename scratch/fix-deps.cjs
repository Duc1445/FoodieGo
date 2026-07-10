const fs=require('fs');
['order-service','inventory-service','payment-service'].forEach(s => {
  let p = `apps/${s}/package.json`;
  let d = JSON.parse(fs.readFileSync(p));
  d.dependencies['@foodiego/rabbit'] = 'workspace:*';
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
  console.log(`Fixed ${s}`);
});
