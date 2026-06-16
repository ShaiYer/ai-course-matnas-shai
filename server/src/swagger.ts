import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Community Center API',
      version: '1.0.0',
      description: 'REST API for the Community Center POC — user registration, event management, and event registration.',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local dev server' }],
    components: {
      parameters: {
        XUserId: {
          in: 'header',
          name: 'X-User-Id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID of the authenticated user (POC auth — no JWT)',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            isAdmin: { type: 'boolean' },
            role: { type: 'string', enum: ['user', 'manager', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            capacity: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            _count: {
              type: 'object',
              properties: { registrations: { type: 'integer' } },
            },
          },
        },
        Registration: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            eventId: { type: 'integer' },
            registeredAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
