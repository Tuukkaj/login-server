import { RedisClientType } from "../cache_connection";

const REFRESH_TOKEN_CACHE = "REFRESH_TOKEN_CACHE";
const EXPIRE_TIME = 60 * 60 * 24; // Day in seconds

class RefreshTokenCache {
  redis: RedisClientType | undefined;

  addRefreshToken = async (userUuid: string, refreshToken: string) => {
    const key = this.getRefreshTokenKey(userUuid);
    await this.redis?.setEx(key, EXPIRE_TIME, refreshToken);
  }

  deleteRefreshToken = async (userUuid: string) => {
    const key = this.getRefreshTokenKey(userUuid);
    await this.redis?.del(key);
  }

  getRefreshToken = async (userUuid: string) => {
    const key = this.getRefreshTokenKey(userUuid);
    return await this.redis?.get(key);
  }

  private getRefreshTokenKey = (userUuid: string): string => {
    return `${REFRESH_TOKEN_CACHE}-${userUuid}`;
  }

  init = async (redis: RedisClientType) => {
    this.redis = redis;
  }
}

export default new RefreshTokenCache(); 