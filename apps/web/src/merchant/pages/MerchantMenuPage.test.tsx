import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MerchantMenuPage } from './MerchantMenuPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getMerchantMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../../shared/services/merchant.api';

// Mock dependencies
vi.mock('../../shared/services/merchant.api', () => ({
  getMerchantMenu: vi.fn(),
  createMenuItem: vi.fn(),
  updateMenuItem: vi.fn(),
  deleteMenuItem: vi.fn(),
}));

describe('MerchantMenuPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.resetAllMocks();
  });

  const mockItems: any[] = [
    {
      id: 'item-1',
      name: 'Burger',
      price: 10.50,
      category_id: 'cat-1',
      is_available: true,
      restaurant_id: 'rest-1',
    }
  ];

  it('renders menu items', async () => {
    vi.mocked(getMerchantMenu).mockResolvedValue(mockItems);
    render(
      <QueryClientProvider client={queryClient}>
        <MerchantMenuPage />
      </QueryClientProvider>
    );

    const nameText = await screen.findByText('Burger');
    expect(nameText).toBeInTheDocument();
    expect(screen.getByText('$10.50')).toBeInTheDocument();
  });

  it('can open add dialog and submit form', async () => {
    vi.mocked(getMerchantMenu).mockResolvedValue(mockItems);
    vi.mocked(createMenuItem).mockResolvedValue({} as any);
    
    render(
      <QueryClientProvider client={queryClient}>
        <MerchantMenuPage />
      </QueryClientProvider>
    );

    await screen.findByText('Burger');
    
    // Open dialog
    await userEvent.click(screen.getByText('Add Item'));
    
    // Fill form
    await userEvent.type(screen.getByPlaceholderText('Item Name'), 'Fries');
    const priceInput = screen.getByPlaceholderText('Price');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '5');
    await userEvent.type(screen.getByPlaceholderText('Category UUID'), 'cat-1');
    
    // Submit
    await userEvent.click(screen.getByRole('button', { name: 'Create Item' }));
    
    await waitFor(() => {
      expect(createMenuItem).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Fries',
        price: 5,
        category_id: 'cat-1',
        is_available: true
      }));
    });
  });

  it('can edit a menu item', async () => {
    vi.mocked(getMerchantMenu).mockResolvedValue(mockItems);
    vi.mocked(updateMenuItem).mockResolvedValue({} as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MerchantMenuPage />
      </QueryClientProvider>
    );

    await screen.findByText('Burger');
    
    // Open edit dialog
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    
    const nameInput = screen.getByDisplayValue('Burger');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Cheeseburger');
    
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(updateMenuItem).toHaveBeenCalledWith('item-1', expect.objectContaining({
        name: 'Cheeseburger'
      }));
    });
  });

  it('can toggle availability', async () => {
    vi.mocked(getMerchantMenu).mockResolvedValue(mockItems);
    vi.mocked(updateMenuItem).mockResolvedValue({} as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MerchantMenuPage />
      </QueryClientProvider>
    );

    await screen.findByText('Burger');
    
    // Toggle switch (it's the first available switch on the item)
    // The switch has an accessible name from the label "Available"
    const switches = screen.getAllByRole('switch');
    await userEvent.click(switches[0]);
    
    await waitFor(() => {
      expect(updateMenuItem).toHaveBeenCalledWith('item-1', expect.objectContaining({
        is_available: false
      }));
    });
  });

  it('can delete an item', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    vi.mocked(getMerchantMenu).mockResolvedValue(mockItems);
    vi.mocked(deleteMenuItem).mockResolvedValue({} as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MerchantMenuPage />
      </QueryClientProvider>
    );

    await screen.findByText('Burger');
    
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(deleteMenuItem).toHaveBeenCalledWith('item-1');
    });

    confirmSpy.mockRestore();
  });
});
