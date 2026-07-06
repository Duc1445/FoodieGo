async function verifyMetrics() {
  console.log('[Verify Metrics] Querying Prometheus API...');
  
  try {
    const res = await fetch('http://localhost:9090/api/v1/query?query=up');
    const data = await res.json();
    
    if (data.status !== 'success') {
      console.error('❌ Prometheus query failed:', data);
      process.exit(1);
    }

    const results = data.data.result;
    const services = results.map(r => r.metric.job);
    
    console.log('[Verify Metrics] Active scrape targets found:', services);
    
    const requiredServices = ['gateway', 'identity-service', 'restaurant-service', 'order-service', 'inventory-service'];
    const missing = requiredServices.filter(s => !services.includes(s));
    
    if (missing.length > 0) {
      console.error('❌ Missing expected metrics targets:', missing);
      console.warn('Note: If you just added inventory-service, you may need to restart prometheus: docker restart foodiego-prometheus');
      process.exit(1);
    }
    
    console.log('✅ Prometheus scraping verified! All services are being monitored.');
    
    // Verify HTTP requests metric exists for order-service
    const httpReqsRes = await fetch('http://localhost:9090/api/v1/query?query=order_service_http_requests_total');
    const httpReqsData = await httpReqsRes.json();
    
    if (httpReqsData.data.result.length > 0) {
      console.log('✅ HTTP request metrics verified for order-service!');
    } else {
      console.warn('⚠️ HTTP request metrics not found for order-service. Might need to wait for scrape interval.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to connect to Prometheus:', err.message);
    process.exit(1);
  }
}

verifyMetrics();
