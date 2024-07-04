import Redis from 'ioredis';

export class RedisService {
  private client: Redis;

  constructor(host: string = '127.0.0.1', port: number = 6379) {
    this.client = new Redis(port, host);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async keys(pattern: string = '*'): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}