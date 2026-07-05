import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'FoodieGo API',
      version: '1.0.0',
      description: 'API Documentation for FoodieGo Microservices',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RestaurantResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            cover_image: { type: 'string' },
            logo: { type: 'string' },
            rating: { type: 'number' },
            total_reviews: { type: 'number' },
            delivery_fee: { type: 'number' },
            minimum_order: { type: 'number' },
            opening_time: { type: 'string' },
            closing_time: { type: 'string' },
            status: { type: 'string' },
          },
        },
        MenuItemResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            restaurant_id: { type: 'string', format: 'uuid' },
            category_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            image_url: { type: 'string' },
            is_available: { type: 'boolean' },
            preparation_time: { type: 'number' },
            display_order: { type: 'number' },
          },
        },
        CreateMenuItemRequest: {
          type: 'object',
          required: ['name', 'price', 'restaurant_id', 'category_id'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            image_url: { type: 'string' },
            restaurant_id: { type: 'string', format: 'uuid' },
            category_id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    '../identity-service/src/modules/*/routes/*.js',
    '../restaurant-service/src/modules/*/routes/*.js',
    '../order-service/src/modules/*/routes/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
