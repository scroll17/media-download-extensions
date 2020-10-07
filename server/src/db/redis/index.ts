import Redis from 'ioredis';

const { REDIS_CONF, NODE_ENV } = process.env;

export const redis = new Redis({
    ...REDIS_CONF,
    keyPrefix: `${NODE_ENV}:`
});