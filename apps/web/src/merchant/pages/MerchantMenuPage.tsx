import { useState } from 'react';
import { Card, CardContent, Button, Input, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@foodiego/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMerchantMenu, getGlobalCategories, createMenuItem, updateMenuItem, deleteMenuItem, MenuItem, MERCHANT_MENU_QUERY_KEY } from '../../shared/services/merchant.api';
import { toast } from 'sonner';
import { Utensils } from 'lucide-react';
import { EmptyState } from '../../shared/components/EmptyState';

export function MerchantMenuPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', category_id: '', image_url: '', description: '', status: 'AVAILABLE', preparation_time: '15' });

  const { data: menuItems, isLoading } = useQuery({
    queryKey: MERCHANT_MENU_QUERY_KEY,
    queryFn: getMerchantMenu,
  });

  const { data: globalCategories } = useQuery({
    queryKey: ['global-categories'],
    queryFn: getGlobalCategories,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_MENU_QUERY_KEY });
      toast.success('Menu item created');
      setIsAddOpen(false);
      setFormData({ name: '', price: '', category_id: '', image_url: '', description: '', status: 'AVAILABLE', preparation_time: '15' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create item');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<MenuItem> }) => updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_MENU_QUERY_KEY });
      toast.success('Menu item updated');
      setEditingItem(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update item');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_MENU_QUERY_KEY });
      toast.success('Menu item deleted');
      setItemToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete item');
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url,
      description: formData.description,
      status: formData.status,
      preparation_time: parseInt(formData.preparation_time) || 15
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const data: Partial<MenuItem> = {
      name: editingItem.name,
      price: Number(editingItem.price),
      status: editingItem.status,
      description: editingItem.description,
      image_url: editingItem.image_url,
      preparation_time: editingItem.preparation_time
    };
    if (editingItem.category_id) {
      data.category_id = editingItem.category_id;
    }
    updateMutation.mutate({
      id: editingItem.id,
      data
    });
  };

  const toggleAvailability = (item: MenuItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { status: item.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE' }
    });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-background text-foreground">
      <div className="flex justify-between items-center bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-2">Add, edit, or remove menu items.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>Add Item</Button>
          </DialogTrigger>
          <DialogContent className="bg-card text-card-foreground border-border">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input className="bg-white text-black border-input" placeholder="Item Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input className="bg-white text-black border-input" placeholder="Delicious food..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (VND)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prep Time (mins)</label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input 
                  className="bg-white text-black border-input" 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
                {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 h-20 rounded object-cover" />}
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground" value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} required>
                  <option value="" disabled>Select a category</option>
                  {(globalCategories as any[])?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                  <option value="AVAILABLE">Available</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="HIDDEN">Hidden</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>Create Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {itemToDelete?.name}?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-card text-card-foreground">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !menuItems || menuItems.length === 0 ? (
            <EmptyState 
              icon={Utensils}
              title="No menu items"
              description="Your menu is currently empty. Add your first item to start receiving orders."
              actionLabel="Add Item"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            <div className="space-y-8">
              {(menuItems as any[]).map(category => (
                <div key={category.id} className="space-y-4">
                  <h2 className="text-xl font-bold border-b border-border pb-2">{category.name}</h2>
                  {(!category.items || category.items.length === 0) ? (
                    <p className="text-sm text-muted-foreground italic">No items in this category.</p>
                  ) : (
                    category.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-4 border border-border rounded-md bg-card text-card-foreground">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          <p className="text-muted-foreground mt-1">${Number(item.price).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <label htmlFor={`available-${item.id}`} className="text-sm text-muted-foreground">Available</label>
                            <input 
                              type="checkbox"
                              id={`available-${item.id}`} 
                              checked={item.is_available} 
                              onChange={() => toggleAvailability(item)}
                              disabled={updateMutation.isPending}
                              role="switch"
                            />
                          </div>
                          
                          <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setEditingItem({ ...item, category_id: category.id })}>Edit</Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card text-card-foreground border-border max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Menu Item</DialogTitle>
                              </DialogHeader>
                              {editingItem && (
                                <form className="space-y-4" onSubmit={handleEditSubmit}>
                                  <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <Input className="bg-white text-black border-input" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} required />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Input className="bg-white text-black border-input" value={editingItem.description || ''} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Price (VND)</label>
                                      <Input
                                        type="number"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                        required
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Prep Time (mins)</label>
                                      <Input
                                        type="number"
                                        value={editingItem.preparation_time || 15}
                                        onChange={(e) => setEditingItem({ ...editingItem, preparation_time: Number(e.target.value) })}
                                        min="1"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Image URL</label>
                                    <Input 
                                      className="bg-white text-black border-input" 
                                      type="url" 
                                      placeholder="https://example.com/image.jpg"
                                      value={editingItem.image_url || ''}
                                      onChange={(e) => setEditingItem({...editingItem, image_url: e.target.value})}
                                    />
                                    {editingItem.image_url && <img src={editingItem.image_url} alt="Preview" className="mt-2 h-20 rounded object-cover" />}
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground" value={editingItem.category_id || ''} onChange={(e) => setEditingItem({...editingItem, category_id: e.target.value})} required>
                                      <option value="" disabled>Select a category</option>
                                      {(globalCategories as any[])?.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground" value={editingItem.status || 'AVAILABLE'} onChange={(e) => setEditingItem({...editingItem, status: e.target.value})} required>
                                      <option value="AVAILABLE">Available</option>
                                      <option value="OUT_OF_STOCK">Out of Stock</option>
                                      <option value="HIDDEN">Hidden</option>
                                      <option value="DISCONTINUED">Discontinued</option>
                                    </select>
                                  </div>
                                  <Button type="submit" className="w-full" disabled={updateMutation.isPending}>Save Changes</Button>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
      
                          <Button variant="destructive" onClick={() => setItemToDelete(item)} disabled={deleteMutation.isPending}>Delete</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
