import jwt from 'jsonwebtoken';
export const generateToken = (userId: string, expiresIn: number): string => {
    return jwt.sign({ id: userId as string }, 'secret', { expiresIn, algorithm: 'HS256' });
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, 'secret', { algorithms: ['HS256'] });
}