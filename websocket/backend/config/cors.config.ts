import cors from 'cors';

export const corsConfig = cors({
    origin: ['http://localhost:9000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
});