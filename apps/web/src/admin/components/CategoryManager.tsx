import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminAPI, ADMIN_QUERY_KEY, Category } from '../../shared/services/admin.api';
import { AdminLoading } from './AdminLoading';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input } from '@foodiego/ui';
import { toast } from 'sonner';
import { Edit, Plus, Trash2 } from 'lucide-react';

export function CategoryManager() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToRemove, setCategoryToRemove] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'categories'],
    queryFn: () => AdminAPI.getAllCategories(),
  });

  const refreshCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'categories'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => AdminAPI.createCategory(data),
    onSuccess: async () => {
      await refreshCategories();
      toast.success('Category created successfully');
      setIsFormOpen(false);
      setName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => AdminAPI.updateCategory(id, data),
    onSuccess: async () => {
      await refreshCategories();
      toast.success('Category updated successfully');
      setIsFormOpen(false);
      setCategoryToEdit(null);
      setName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: AdminAPI.deleteCategory,
    onSuccess: async () => {
      await refreshCategories();
      toast.success('Category removed successfully');
      setCategoryToRemove(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove category');
    },
  });

  if (isLoading) return <AdminLoading text="Loading categories..." />;

  const openCreateDialog = () => {
    setCategoryToEdit(null);
    setName('');
    setIsFormOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category);
    setName(category.name);
    setIsFormOpen(true);
  };

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    if (categoryToEdit) {
      updateMutation.mutate({ id: categoryToEdit.id, data: { name } });
      return;
    }

    createMutation.mutate({ name });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Category Management</h2>
          <p className="text-slate-500">Manage shared category master data. Only category name is required.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories?.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{category.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          category.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setCategoryToRemove(category)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <form onSubmit={submitForm}>
            <DialogHeader>
              <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Category Name
                </label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!categoryToRemove} onOpenChange={(open) => !open && setCategoryToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Remove <span className="font-medium text-slate-900">{categoryToRemove?.name}</span> from the shared category list?
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCategoryToRemove(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => categoryToRemove && deleteMutation.mutate(categoryToRemove.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
