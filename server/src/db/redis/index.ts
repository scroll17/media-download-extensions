/*external modules*/
import Redis from 'ioredis';
/*other*/
import {setEnv} from "../../env";

const { NODE_ENV } = process.env;

export const redis = new Redis({
    ...setEnv.REDIS_CONF,
    keyPrefix: `${NODE_ENV}:`
});