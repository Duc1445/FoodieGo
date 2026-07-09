export class GatewayRegistry {
  constructor() {
    this.gateways = new Map();
  }

  register(name, gatewayInstance) {
    this.gateways.set(name, gatewayInstance);
  }

  resolve(name) {
    const gateway = this.gateways.get(name);
    if (!gateway) {
      throw new Error(`Payment gateway '${name}' is not registered.`);
    }
    return gateway;
  }
}

// Singleton instance to be populated
export const gatewayRegistry = new GatewayRegistry();
