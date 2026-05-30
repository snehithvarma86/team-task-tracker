import { redisClient } from '../config/redis';

export const cacheService = {
  async get(key: string): Promise<any | null> {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: any, ttlSeconds: number = 300) {
    if (!redisClient.isOpen) return;
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  },

  async invalidateUserTasks(userId: number) {
    if (!redisClient.isOpen) return;
    const pattern = `tasks:user:${userId}:*`;
    
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
};