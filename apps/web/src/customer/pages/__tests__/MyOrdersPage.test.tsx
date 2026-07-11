import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MyOrdersPage } from '../MyOrdersPage';
import { OrderAPI } from '../../../shared/services/order.api';

vi.mock('../../../shared/services/order.api', () => ({
  OrderAPI: {
    getOrders: vi.fn(),
  },
}));

vi.mock('../../../shared/services/restaurant.api', () => ({
  RestaurantAPI: {
    getRestaurantById: vi.fn().mockResolvedValue({
      id: 'r1',
      name: 'Test Restaurant',
      logo: 'https://test.com/logo.png',
    }),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MyOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    queryClient.cancelQueries();
    queryClient.clear();
  });

  it('Loading - shows skeleton loader', () => {
    vi.mocked(OrderAPI.getOrders).mockImplementation(() => new Promise(() => {})); // never resolves
    renderWithProviders(<MyOrdersPage />);
    expect(screen.getByText('Order History')).toBeInTheDocument();
  });

  it('Empty history - shows no orders message', async () => {
    vi.mocked(OrderAPI.getOrders).mockResolvedValueOnce([]);
    renderWithProviders(<MyOrdersPage />);
    
    expect(await screen.findByText('No orders found')).toBeInTheDocument();
    expect(screen.getByText("You haven't placed any orders yet. Once you do, they will appear here.")).toBeInTheDocument();
  });

  it('Successful fetch - renders orders', async () => {
    const mockOrders = [
      {
        id: '12345678-aaaa-bbbb-cccc-dddddddddddd',
        restaurantId: 'r1',
        status: 'completed',
        total: 1500,
        createdAt: new Date().toISOString(),
      },
    ];
    vi.mocked(OrderAPI.getOrders).mockResolvedValueOnce(mockOrders);
    
    renderWithProviders(<MyOrdersPage />);
    
    expect(await screen.findByText('Order #12345678')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('Total: $15.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
  });

  it('API Error - shows error state', async () => {
    vi.mocked(OrderAPI.getOrders).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<MyOrdersPage />);
    
    expect(await screen.findByText('Failed to load orders')).toBeInTheDocument();
    expect(screen.getByText("We couldn't fetch your order history right now. Please try again later.")).toBeInTheDocument();
  });
});
