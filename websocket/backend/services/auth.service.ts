import { getCollection } from "@/config/db.config";
import { LoginDto, User } from "@/dto/user.request-dto";
import { generateToken } from "@/utils/jwt.utils";

export class AuthService {

    async loginUser(loginDto: LoginDto) {
        try {
            const user = await this.findUserByEmialId(loginDto.email, loginDto.password);
            const token: string = generateToken(user._id!.toString(), 1200) as string;
            const refreshToken: string = generateToken(user._id!.toString(), 86400) as string;
            return {accessToken: token, refreshToken: refreshToken, details: {
                _id: user._id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            }};
        } catch (error: any) {
            console.error('Error logging in user', error);
            throw error;
        }
    }

    private async findUserByEmialId(email: string, password: string) {
        try {
            const userCollection = await getCollection('users');
            const user: User | null = await userCollection.findOne({ email: email }) as User | null;
            if (!user) {
                throw new Error('User not found');
            }
            if (user.password as string !== password) {
                throw new Error('Invalid password');
            }
            return user;
        } catch (error: any) {
            console.error('Error finding user by email', error);
            throw error;
        }
    }
}