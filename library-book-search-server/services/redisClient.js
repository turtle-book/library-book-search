const { createClient } = require('redis');

const connectToRedis = async () => {
  const client = createClient();

  client.on('error', (err) => {
    console.error('Redis 클라이언트 에러', err);
  });

  await client.connect();

  return client;
}

module.exports = connectToRedis;
