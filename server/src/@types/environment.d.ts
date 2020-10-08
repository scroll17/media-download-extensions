declare global {
    namespace NodeJS {
        interface ProcessEnv {
            IG_USERNAME: string;
            IG_PASSWORD: string;
            TG_TOKEN: string;
            PORT: number,
            NODE_ENV: string;
            VALID_TELEGRAM_IDS: number[];
        }
    }
}

export { ProcessEnv }