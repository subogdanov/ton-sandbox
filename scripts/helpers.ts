export enum ENV {
    TEST = 'test',
    PROD = 'production',
}

export function resolveEnv(): ENV {
    switch (process.env.NODE_ENV) {
        case ENV.PROD:
            return ENV.PROD
        default:
            return ENV.TEST
    }
}
