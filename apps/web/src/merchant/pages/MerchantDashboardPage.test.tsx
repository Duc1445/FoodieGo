import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MerchantDashboardPage } from './MerchantDashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getMerchantMenu, getMerchantStats } from '../../shared/services/merchant.api';

vi.mock('../../shared/services/merchant.api', () => ({
  getMerchantMenu: vi.fn(),
  getMerchantStats: vi.fn(),
}));

describe('MerchantDashboardPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchInterval: false,
        },
      },
    });
    vi.resetAllMocks();
  });

  afterEach(() => {
    queryClient.cancelQueries();
    queryClient.clear();
  });

  it('renders the dashboard shell', () => {
    vi.mocked(getMerchantStats).mockResolvedValue({ total_revenue: 0, total_orders: 0 } as any);
    vi.mocked(getMerchantMenu).mockResolvedValue([] as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MerchantDashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Merchant Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Active Menu Items')).toBeInTheDocument();
  });

  it.skip('renders fetched values', async () => {
    vi.mocked(getMerchantStats).mockResolvedValue({ total_revenue: 123450, total_orders: 7 } as any);
    vi.mocked(getMerchantMenu).mockResolvedValue([
      { id: 'category-1', items: [{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }] },
    ] as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MerchantDashboardPage />
      </QueryClientProvider>
    );

    await screen.findByText('123,450 VND');
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
