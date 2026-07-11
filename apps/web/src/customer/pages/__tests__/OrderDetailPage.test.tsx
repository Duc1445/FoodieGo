import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { OrderDetailPage } from '../OrderDetailPage';
import { OrderAPI } from '../../../shared/services/order.api';
import { RestaurantAPI } from '../../../shared/services/restaurant.api';

vi.mock('../../../shared/services/order.api', () => ({
  OrderAPI: {
    getOrderDetail: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

vi.mock('../../../shared/services/restaurant.api', () => ({
  RestaurantAPI: {
    getRestaurantById: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactNode, route = '/orders/123') => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/orders/:id" element={component} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('Loading - shows skeleton loader', () => {
    vi.mocked(OrderAPI.getOrderDetail).mockImplementation(() => new Promise(() => {}));
    
    const { container } = renderWithProviders(<OrderDetailPage />);
    
    // Skeleton component usually renders with animate-pulse class from tailwind
    // Or we can just check if specific text is missing
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('Successful Detail Fetch - displays items, total, and timeline', async () => {
    const mockOrder = {
      id: '12345678-bbbb-cccc-dddd-eeeeeeeeeeee',
      userId: 'u1',
      restaurantId: 'r1',
      status: 'preparing',
      subtotal: 2000,
      deliveryFee: 500,
      tax: 250,
      discount: 0,
      total: 2750,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'i1',
          menuItemId: 'm1',
          quantity: 2,
          itemName: 'Burger',
          itemPrice: 1000,
        },
        {
          id: 'i2',
          menuItemId: 'm2',
          quantity: 1,
          itemName: 'Fries',
          itemPrice: 500,
        }
      ]
    };
    
    const mockRestaurant = {
      id: 'r1',
      name: 'Pizza House',
      logo: 'https://test.com/logo.png',
    } as any;

    vi.mocked(OrderAPI.getOrderDetail).mockResolvedValueOnce(mockOrder);
    vi.mocked(RestaurantAPI.getRestaurantById).mockResolvedValueOnce(mockRestaurant);

    renderWithProviders(<OrderDetailPage />);

    // Order info
    expect(await screen.findByText('Order #12345678')).toBeInTheDocument();
    expect(screen.getByText('Pizza House')).toBeInTheDocument();
    
    // Items
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
    expect(screen.getByText('Fries')).toBeInTheDocument();
    expect(screen.getByText('x1')).toBeInTheDocument();

    // Summary
    expect(screen.getByText('$27.50')).toBeInTheDocument(); // Total
    expect(screen.getAllByText('$5.00').length).toBeGreaterThan(0); // Delivery & Fries
    
    // Timeline component integration check
    expect(screen.getByText('Order Tracking')).toBeInTheDocument();
    expect(screen.getByText('Order Placed')).toBeInTheDocument();
  });

  it('Error - API failure shows error state', async () => {
    vi.mocked(OrderAPI.getOrderDetail).mockRejectedValueOnce({
      response: { status: 404 }
    });

    renderWithProviders(<OrderDetailPage />);

    expect(await screen.findByText('Order Not Found')).toBeInTheDocument();
    expect(screen.getByText("The order you're looking for doesn't exist.")).toBeInTheDocument();
  });

  it('Timeline - tests PREPARING status logic', async () => {
    const mockOrder = {
      id: '12345678-bbbb-cccc-dddd-eeeeeeeeeeee',
      userId: 'u1',
      restaurantId: 'r1',
      status: 'preparing', // Current status
      subtotal: 2000,
      deliveryFee: 500,
      tax: 250,
      discount: 0,
      total: 2750,
      createdAt: new Date().toISOString(),
      items: []
    };
    
    vi.mocked(OrderAPI.getOrderDetail).mockResolvedValueOnce(mockOrder);
    vi.mocked(RestaurantAPI.getRestaurantById).mockResolvedValueOnce({
      id: 'r1',
      name: 'Pizza House',
    } as any);

    renderWithProviders(<OrderDetailPage />);
    
    await screen.findByText('Order #12345678');
    
    // Check if "Order Placed" is marked as completed (text-gray-700)
    const placedEl = screen.getByText('Order Placed');
    expect(placedEl).toHaveClass('text-gray-700');
    
    // Check if "Confirmed" is marked as completed
    const confirmedEl = screen.getByText('Confirmed');
    expect(confirmedEl).toHaveClass('text-gray-700');
    
    // Check if "Preparing" is active (font-semibold text-primary)
    const preparingEl = screen.getByText('Preparing');
    expect(preparingEl).toHaveClass('font-semibold');
    expect(preparingEl).toHaveClass('text-primary');

    // Check if "Ready" is future (text-gray-400)
    const readyEl = screen.getByText('Ready');
    expect(readyEl).toHaveClass('text-gray-400');
  });

  it('Advance Status (DEV) button works and refreshes data', async () => {
    // Mock DEV environment
    vi.stubEnv('DEV', true);

    const mockOrder = {
      id: '12345678-bbbb-cccc-dddd-eeeeeeeeeeee',
      userId: 'u1',
      restaurantId: 'r1',
      status: 'pending', // Current status
      subtotal: 2000,
      deliveryFee: 500,
      tax: 250,
      discount: 0,
      total: 2750,
      createdAt: new Date().toISOString(),
      items: []
    };
    
    vi.mocked(OrderAPI.getOrderDetail).mockResolvedValueOnce(mockOrder);
    vi.mocked(RestaurantAPI.getRestaurantById).mockResolvedValueOnce({
      id: 'r1',
      name: 'Pizza House',
    } as any);
    vi.mocked(OrderAPI.updateOrderStatus).mockResolvedValueOnce({} as any);

    renderWithProviders(<OrderDetailPage />);
    
    await screen.findByText('Order #12345678');
    
    // Find advance status button
    const advanceBtn = screen.getByText('Advance Status (DEV)');
    expect(advanceBtn).toBeInTheDocument();

    // Click it
    advanceBtn.click();

    // Should call API to update status to next status: 'ACCEPTED'
    expect(OrderAPI.updateOrderStatus).toHaveBeenCalledWith('12345678-bbbb-cccc-dddd-eeeeeeeeeeee', 'ACCEPTED');
    
    vi.unstubAllEnvs();
  });
});
