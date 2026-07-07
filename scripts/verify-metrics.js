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
    const services = results.map((r) => r.metric.job);

    console.log('[Verify Metrics] Active scrape targets found:', services);

    const requiredServices = [
      'gateway',
      'identity-service',
      'restaurant-service',
      'order-service',
      'inventory-service',
      'payment-service',
    ];
    const missing = requiredServices.filter((s) => !services.includes(s));

    if (missing.length > 0) {
      console.error('❌ Missing expected metrics targets:', missing);
      console.warn(
        'Note: If you just added a service, you may need to restart prometheus: docker restart foodiego-prometheus',
      );
      process.exit(1);
    }

    console.log('✅ Prometheus scraping verified! All services are being monitored.');

    // Verify specific metrics for Payment Service
    const metricsToCheck = ['payment_requests_total', 'payment_authorized_total'];

    let allFound = true;
    for (const metric of metricsToCheck) {
      const metricRes = await fetch(`http://localhost:9090/api/v1/query?query=${metric}`);
      const metricData = await metricRes.json();

      if (metricData.status === 'success' && metricData.data.result.length > 0) {
        console.log(`✅ Metric '${metric}' found! Values:`);
        metricData.data.result.forEach((r) => {
          console.log(`   - Value: ${r.value[1]}`);
        });
      } else {
        console.error(`❌ Metric '${metric}' not found or has no data yet.`);
        allFound = false;
      }
    }

    if (allFound) {
      console.log(
        '\n✅ All expected business metrics were successfully recorded and verified in Prometheus!',
      );
      process.exit(0);
    } else {
      console.error('\n❌ Some metrics were missing.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Failed to connect to Prometheus:', err.message);
    process.exit(1);
  }
}

verifyMetrics();
