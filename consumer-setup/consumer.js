const{Kafka }=require('kafkajs')

const kafka = new Kafka ({
    clientId: 'kafkajs',
    brokers: process.env.KAFKA_BROKER.split(',') // Use the brokers from environment variable
});

const consumer=kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });
  
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
        //  key: message.key.toString(),
          value: message.value.toString(),
          headers: message.headers,
          partition
        });
      },
    });
  };
  
  run().catch(console.error);

