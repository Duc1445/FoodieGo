import { api } from '../api/api';

export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewDto {
  restaurantId: string;
  orderId?: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export const ReviewAPI = {
  createReview: async (data: CreateReviewDto): Promise<Review> => {
    const res = await api.post<{ success: boolean; data: Review }>('/reviews', data);
    return res.data.data;
  },

  getReviewById: async (id: string): Promise<Review> => {
    const res = await api.get<{ success: boolean; data: Review }>(`/reviews/${id}`);
    return res.data.data;
  },

  getReviewByOrderId: async (orderId: string): Promise<Review | null> => {
    try {
      const res = await api.get<{ success: boolean; data: Review }>(`/reviews/order/${orderId}`);
      return res.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  getReviewsByRestaurantId: async (restaurantId: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Review[]> => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const url = `/reviews/restaurant/${restaurantId}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: Review[] }>(url);
    return res.data.data;
  },

  getReviewsByUserId: async (userId: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Review[]> => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const url = `/reviews/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: Review[] }>(url);
    return res.data.data;
  },

  updateReview: async (id: string, data: UpdateReviewDto): Promise<Review> => {
    const res = await api.put<{ success: boolean; data: Review }>(`/reviews/${id}`, data);
    return res.data.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  getRestaurantRating: async (restaurantId: string): Promise<ReviewStats> => {
    const res = await api.get<{ success: boolean; data: ReviewStats }>(`/reviews/restaurant/${restaurantId}/rating`);
    return res.data.data;
  },
};

export const REVIEWS_QUERY_KEY = ['reviews'];
