import { useState } from "react";
import { AuthRequestDto } from "../dto/UserDto";
import { loginUser } from "../services/user.api";
import { AxiosResponse } from "axios";
import { setCookieWithAttributes } from "../utils/cookies";
import { useNavigate } from "react-router-dom";
import localStorageUtil from "../utils/localstorage";

const LoginPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleLogin = async () => {
        console.log('Login');
        const authDto: AuthRequestDto = {
            email: email,
            password: password
        }
        await loginUser(authDto).then((response) => {
            console.log(response);
            setCookieWithAttributes('accessToken', response.data.accessToken);
            setCookieWithAttributes('refreshToken', response.data.refreshToken);
            localStorageUtil.setItem('userId', response.data.details._id);
            localStorageUtil.setItem('user', JSON.stringify(response.data.details));
            navigate('/dashboard');
        }).catch((error) => {
            console.log(error);
        });
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                {/* Login Form */}  
                <form className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {/* Login Button */}
                    <button
                        type="button"
                        onClick={() => handleLogin()}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;