import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { log } from "node:console";
import { decode } from "node:punycode";

export class Authenticate {

    private static instance: Authenticate;
    private constructor() {
        if (Authenticate.instance) {
            return Authenticate.instance;
        }
        Authenticate.instance = this;
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Authenticate();
        }
        return this.instance;
    }

    public authenticateUser = (req: Request, res: Response, next: NextFunction) => {
        if (req.originalUrl.startsWith('/auth')) {
            return next();
        }
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        if (this.verifyToken(token)) {
            const decoded = jwt.verify(token, 'secret');
            (req as any).userId = (decoded as any).id as string;

            return next();
        } else {
            return res.status(401).json({ message: 'Authentication failed' });
        }
    }

    public authenticateWebSocket(req: any) {
        const token = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('token');
        if (!token) {
            throw new Error('Token is required');
        }
        if (this.verifyToken(token)) {
        const decoded = jwt.verify(token, 'secret');
            (req as any).userId = (decoded as any).id as string;
            return true;
        } else {
            return false;
        }
    }

    private verifyToken(token: string) {
        try {
            return jwt.verify(token, 'secret');
        } catch (error: any) {
            console.error('Error verifying token', error);
            return false;
        }
    }
}
