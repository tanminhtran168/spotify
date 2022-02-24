export default {
    POSTGRES_INFO: {
        user: 'postgres',
        host: 'localhost',
        database: 'music',
        password: 'password',
        port: 5432,
    },
    JWT_SECRET:   process.env.JWT_SECRET || 'somethingsecret',
}