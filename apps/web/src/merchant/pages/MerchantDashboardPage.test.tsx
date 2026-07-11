import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MerchantDashboardPage } from './MerchantDashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getMerchantOrders } from '../../shared/services/merchant.api';

// Mock dependencies
vi.mock('../../shared/services/merchant.api', () => ({
  getMerchantOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

describe('MerchantDashboardPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.resetAllMocks();
  });

  it('renders loading skeleton initially', () => {
    vi.mocked(getMerchantOrders).mockReturnValue(new Promise(() => {})); // never resolves
    render(
      <QueryClientProvider client={queryClient}>
        <MerchantDashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Merchant Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recent Orders')).toBeInTheDocument();
  });

  it('renders empty state when no orders', async () => {
    vi.mocked(getMerchantOrders).mockResolvedValue([]);
    render(
      <QueryClientProvider client={queryClient}>
        <MerchantDashboardPage />
      </QueryClientProvider>
    );

    const emptyText = await screen.findByText('No orders yet.');
    expect(emptyText).toBeInTheDocument();
  });

  it('renders orders when available', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        restaurantId: 'rest-1',
        userId: 'user-1',
        status: 'CONFIRMED' as any,
        subtotal: 10,
        deliveryFee: 2,
        tax: 1,
        discount: 0,
        total: 13,
        createdAt: '2026-01-01T00:00:00.000Z',
        items: []
      }
    ];

    vi.mocked(getMerchantOrders).mockResolvedValue(mockOrders);
    render(
      <QueryClientProvider client={queryClient}>
        <MerchantDashboardPage />
      </QueryClientProvider>
    );

    const orderIdText = await screen.findByText('Order #order-1');
    expect(orderIdText).toBeInTheDocument();
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
  });
});
