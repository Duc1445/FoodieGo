import { connect } from 'amqplib';

export async function startReplayConsumer(amqpUrl) {
  const connection = await connect(amqpUrl);
  const channel = await connection.createChannel();

  const replayExchange = 'replay_exchange';
  const originalExchange = process.env.EVENT_EXCHANGE || 'foodiego_exchange';

  await channel.assertExchange(replayExchange, 'topic', { durable: true });
  await channel.assertExchange(originalExchange, 'topic', { durable: true });

  const queueName = 'replay_queue';
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, replayExchange, '#'); // Bind all routing keys

  console.log(`[ReplayConsumer] Listening on ${queueName}`);

  channel.prefetch(10); // Rate limit the replay rate

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      // Forward to original exchange
      const routingKey = msg.fields.routingKey;
      
      channel.publish(
        originalExchange,
        routingKey,
        msg.content,
        { persistent: true }
      );

      console.log(`[ReplayConsumer] Forwarded message ${routingKey} to ${originalExchange}`);
      channel.ack(msg);
    } catch (err) {
      console.error('[ReplayConsumer] Failed to forward:', err);
      // Nack and requeue
      channel.nack(msg, false, true);
    }
  });
}
