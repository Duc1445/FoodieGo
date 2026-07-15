const fs = require('fs');
let code = fs.readFileSync('apps/web/src/merchant/pages/MerchantMenuPage.tsx', 'utf8');

code = code.replace(/is_available: true/g, "status: 'AVAILABLE'");

code = code.replace(
  /const toggleAvailability = \([\s\S]*?\}?;/,
  `const changeStatus = (item: any, newStatus: string) => {
    updateMutation.mutate({
      id: item.id,
      data: { status: newStatus }
    });
  };`,
);

code = code.replace(/is_available: formData\.is_available/, 'status: formData.status');
code = code.replace(/is_available: editFormData\.is_available/, 'status: editFormData.status');

code = code.replace(
  /<div className="flex items-center space-x-2 pt-2">[\s\S]*?<input[\s\S]*?type="checkbox"[\s\S]*?checked=\{formData\.is_available\}[\s\S]*?onChange=\{\(e\) => setFormData\(\{\.\.\.formData, is_available: e\.target\.checked\}\)\}[\s\S]*?\/>[\s\S]*?<label className="text-sm font-medium">Available<\/label>[\s\S]*?<\/div>/,
  `<div>
  <label className="text-sm font-medium">Status</label>
  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background text-foreground" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
    <option value="AVAILABLE">Available</option>
    <option value="OUT_OF_STOCK">Out of Stock</option>
    <option value="HIDDEN">Hidden</option>
    <option value="DISCONTINUED">Discontinued</option>
  </select>
</div>`,
);

code = code.replace(
  /<div className="flex items-center space-x-2">[\s\S]*?<label htmlFor=\{`available-\$\{item\.id\}`\}[\s\S]*?<input[\s\S]*?type="checkbox"[\s\S]*?checked=\{item\.is_available\}[\s\S]*?onChange=\{.*?\}[\s\S]*?\/>[\s\S]*?<\/div>/,
  `<div className="flex items-center space-x-2">
  <label htmlFor={\`status-\${item.id}\`} className="text-sm text-muted-foreground">Status</label>
  <select 
    id={\`status-\${item.id}\`}
    value={item.status || 'AVAILABLE'}
    onChange={(e) => changeStatus(item, e.target.value)}
    disabled={updateMutation.isPending}
    className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
  >
    <option value="AVAILABLE">Available</option>
    <option value="OUT_OF_STOCK">Out of Stock</option>
    <option value="HIDDEN">Hidden</option>
    <option value="DISCONTINUED">Discontinued</option>
  </select>
</div>`,
);

code = code.replace(/is_available: item\.is_available/, "status: item.status || 'AVAILABLE'");

code = code.replace(
  /<div className="flex items-center space-x-2 pt-2">[\s\S]*?<input[\s\S]*?type="checkbox"[\s\S]*?checked=\{editFormData\.is_available\}[\s\S]*?onChange=\{\(e\) => setEditFormData\(\{\s*\.\.\.editFormData,\s*is_available:\s*e\.target\.checked\s*\}\)\}[\s\S]*?\/>[\s\S]*?<label className="text-sm font-medium">Available<\/label>[\s\S]*?<\/div>/,
  `<div>
  <label className="text-sm font-medium">Status</label>
  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background text-foreground" value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}>
    <option value="AVAILABLE">Available</option>
    <option value="OUT_OF_STOCK">Out of Stock</option>
    <option value="HIDDEN">Hidden</option>
    <option value="DISCONTINUED">Discontinued</option>
  </select>
</div>`,
);

fs.writeFileSync('apps/web/src/merchant/pages/MerchantMenuPage.tsx', code);
console.log('MerchantMenuPage updated');
