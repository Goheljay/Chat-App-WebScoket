import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authentication";
import { setCookieWithAttributes } from "../utils/cookies";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onFormSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    loginUser({ email, password })
      .then((response) => {
        const token = response.data.accessToken;
        setCookieWithAttributes(token);
        navigate("/admin");
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage("Invalid credentials. Please try again.");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login
        </h2>

        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}

        <form onSubmit={onFormSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <input
            type="submit"
            value="Login"
            className="w-full bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-grey-500 focus:ring-opacity-50"
          />
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/auth/signup")}
            className="text-blue-500 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
