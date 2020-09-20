declare global {
    namespace NodeJS {
        interface ProcessEnv {
            IG_USERNAME: string;
            IG_PASSWORD: string;
        }
    }
}

export { ProcessEnv }