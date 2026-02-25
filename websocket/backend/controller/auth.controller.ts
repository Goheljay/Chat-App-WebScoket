import { LoginDto } from "@/dto/user.request-dto";
import { AuthService } from "@/services/auth.service";
import { Request, Response } from 'express';

export class AuthController {
    constructor(private authService: AuthService = new AuthService()) { }

    loginUser = async (req: Request, res: Response) => {
        const loginDto: LoginDto = req.body as LoginDto;
        try {
            const loginResp: Object = await this.authService.loginUser(loginDto);
            return res.status(200).json({ message: 'User logged in successfully', data: loginResp, status: 200 })
        } catch (error: any) {
            console.error('Error logging in user', error);
            const errorMessage = error?.message || 'Error logging in user';
            let statusCode = 500;

            if (errorMessage === 'User not found') {
                statusCode = 404;
            } else if (errorMessage === 'Invalid password') {
                statusCode = 401;
            }

            return res.status(statusCode).json({ message: errorMessage, data: error, status: statusCode })
        }
    }

}