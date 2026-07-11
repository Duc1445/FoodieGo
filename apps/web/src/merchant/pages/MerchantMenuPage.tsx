import { useState } from 'react';
import { Card, CardContent, Button, Input, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@foodiego/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMerchantMenu, createMenuItem, updateMenuItem, deleteMenuItem, MenuItem } from '../../shared/services/merchant.api';
import { toast } from 'sonner';

export function MerchantMenuPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState({ name: '', price: '', category_id: '', is_available: true });

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['merchantMenu'],
    queryFn: getMerchantMenu,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      toast.success('Menu item created');
      setIsAddOpen(false);
      setFormData({ name: '', price: '', category_id: '', is_available: false });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create item');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<MenuItem> }) => updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
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
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      toast.success('Menu item deleted');
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
      is_available: formData.is_available
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMutation.mutate({
      id: editingItem.id,
      data: {
        name: editingItem.name,
        price: Number(editingItem.price),
        category_id: editingItem.category_id,
        is_available: editingItem.is_available
      }
    });
  };

  const toggleAvailability = (item: MenuItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { is_available: !item.is_available }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-2">Add, edit, or remove menu items.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Item Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input placeholder="Price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium">Category ID</label>
                <Input placeholder="Category UUID" value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} required />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_available} 
                  onChange={(e) => setFormData({...formData, is_available: e.target.checked})} 
                />
                <label className="text-sm font-medium">Available</label>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>Create Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !menuItems || menuItems.length === 0 ? (
            <p className="text-muted-foreground">No menu items found.</p>
          ) : (
            <div className="space-y-4">
              {menuItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">${Number(item.price).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Category: {item.category_id}</p>
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
                        <Button variant="outline" onClick={() => setEditingItem(item)}>Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Menu Item</DialogTitle>
                        </DialogHeader>
                        {editingItem && (
                          <form className="space-y-4" onSubmit={handleEditSubmit}>
                            <div>
                              <label className="text-sm font-medium">Name</label>
                              <Input value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} required />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Price</label>
                              <Input type="number" step="0.01" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: Number(e.target.value)})} required />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Category ID</label>
                              <Input value={editingItem.category_id} onChange={(e) => setEditingItem({...editingItem, category_id: e.target.value})} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>Save Changes</Button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button variant="destructive" onClick={() => handleDelete(item.id)} disabled={deleteMutation.isPending}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
