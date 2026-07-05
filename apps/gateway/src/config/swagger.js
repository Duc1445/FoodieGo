import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'FoodieGo API',
      version: '1.0.0',
      description: 'API Documentation for FoodieGo Microservices (Identity, Restaurant, Order)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Gateway API',
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    '../identity-service/src/modules/**/*.routes.js',
    '../restaurant-service/src/modules/**/*.routes.js',
    '../order-service/src/modules/**/*.routes.js'
  ], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "FoodieGo API Documentation"
  }));
};
