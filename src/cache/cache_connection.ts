import { createClient } from "redis";
import RefreshTokenCache from "./caches/refresh_token_cache";

export type RedisClientType = ReturnType<typeof createClient>;

let redis: RedisClientType | undefined;

export default {
  init: async (): Promise<RedisClientType> => {
    redis = createClient({
      url: process.env.REDIS_URL
    });

    await redis.connect();

    RefreshTokenCache.init(redis);

    return redis;
  }
};
