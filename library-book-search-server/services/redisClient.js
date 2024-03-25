const { createClient } = require('redis');

const connectToRedis = async () => {
  const client = createClient();

  client.on('error', (error) => {
    console.log('Redis 클라이언트 에러 발생');
    console.error(error);
  });

  await client.connect();

  return client;
}

module.exports = connectToRedis;
