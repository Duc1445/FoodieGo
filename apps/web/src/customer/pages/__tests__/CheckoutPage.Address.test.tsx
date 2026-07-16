import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutPage } from '../CheckoutPage';
import { useCartStore } from '../../../shared/stores/useCartStore';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { AuthAPI } from '../../../shared/services/auth.api';
import { CheckoutAPI } from '../../../shared/services/checkout.api';

vi.mock('../../../shared/stores/useCartStore');
vi.mock('../../../shared/stores/useAuthStore');
vi.mock('../../../shared/services/auth.api');
vi.mock('../../../shared/services/checkout.api');

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CheckoutPage Address Flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();

    const customerStore = {
      getUser: () => ({ id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'customer' }),
      isAuthenticated: () => true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn()
    };
    
    // Mock user store selector behavior
    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      if (typeof selector === 'function') {
        return selector(customerStore);
      }
      return customerStore as any;
    });

    // Also mock getState for non-hook usage
    (useAuthStore as any).getState = () => customerStore;

    // Mock cart
    vi.mocked(useCartStore).mockReturnValue({
      items: [{ id: '1', name: 'Burger', quantity: 1, price: 50000 }],
      summary: { totalPrice: 50000, totalItems: 1 },
      version: 1,
      actions: {
        clearCart: vi.fn(),
      }
    } as any);

    // Mock successful checkout
    vi.mocked(CheckoutAPI.checkout).mockResolvedValue({ orderId: 'order-1', status: 'PENDING', total: 65000 });
  });

  afterEach(() => {
    queryClient.cancelQueries();
    queryClient.clear();
  });

  it('submits checkout with selected saved address', async () => {
    // Mock user has saved addresses
    vi.mocked(AuthAPI.getAddresses).mockResolvedValue([
      { id: 'addr-1', userId: 'user-1', address: '123 Test St', phone: '0123456789', isDefault: true, isActive: true }
    ]);

    renderComponent();

    // Wait for address to load
    await waitFor(() => {
      expect(screen.getAllByRole('radio').length).toBeGreaterThan(0);
    });

    // Address should be auto-selected (the first radio button)
    const radioBtns = screen.getAllByRole('radio');
    await waitFor(() => {
      expect(radioBtns[0]).toBeChecked();
    });

    // Submit form
    const submitBtn = await screen.findByRole('button', { name: /Place Order/i });
    fireEvent.click(submitBtn);

    // Verify checkout was called with the correct address
    await waitFor(() => {
      expect(CheckoutAPI.checkout).toHaveBeenCalledWith(expect.objectContaining({
        addressId: 'addr-1'
      }));
    });
    
    // AuthAPI.addAddress should NOT be called since an address is selected
    expect(AuthAPI.addAddress).not.toHaveBeenCalled();
  });

  it('auto-creates address when using manual entry', async () => {
    // Mock no saved addresses
    vi.mocked(AuthAPI.getAddresses).mockResolvedValue([]);
    vi.mocked(AuthAPI.addAddress).mockResolvedValue({
      id: 'new-addr-1', userId: 'user-1', address: '456 New St', phone: '0987654321', isDefault: false, isActive: true
    });

    renderComponent();

    // Should render AddressForm (manual inputs)
    const addressInput = await screen.findByPlaceholderText('Enter your delivery address');
    expect(addressInput).toBeInTheDocument();

    // Fill out form
    fireEvent.change(addressInput, { target: { value: '456 New St' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), { target: { value: '0987654321' } });

    // Submit form
    const submitBtn = await screen.findByRole('button', { name: /Place Order/i });
    fireEvent.click(submitBtn);
    
    // Wait for address creation and checkout
    await waitFor(() => {
      expect(AuthAPI.addAddress).toHaveBeenCalledWith('user-1', {
        address: '456 New St',
        phone: '0987654321',
        isDefault: false
      });
    });

    await waitFor(() => {
      expect(CheckoutAPI.checkout).toHaveBeenCalledWith(expect.objectContaining({
        addressId: 'new-addr-1'
      }));
    });
  });
});
