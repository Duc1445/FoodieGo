export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'This dependency is part of a circular relationship. You might want to revise your solution.',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'domain-isolation',
      severity: 'error',
      comment: 'Domain layer should not depend on Application, Infrastructure, Express, RabbitMQ, or PostgreSQL.',
      from: {
        path: 'domain/'
      },
      to: {
        path: '(application/|infrastructure/|express|amqplib|pg)'
      }
    },
    {
      name: 'application-isolation',
      severity: 'error',
      comment: 'Application layer should not depend directly on Infrastructure (Repositories, Gateways). Use interfaces/Domain.',
      from: {
        path: 'application/'
      },
      to: {
        path: 'infrastructure/'
      }
    },
    {
      name: 'no-controller-to-repository',
      severity: 'error',
      comment: 'Controllers must not access Repositories directly. Use an Application Service as an intermediary.',
      from: {
        path: 'controller'
      },
      to: {
        path: 'repository'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg']
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    }
  }
};
