import React, { useActionState } from "react";
import { Link, Navigate } from "react-router-dom";
import { signIn, useSession } from "../lib/auth-client";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import type { ActionState } from "@/types";

export const LoginPage: React.FC = () => {
  const session = useSession();

  const initialState: ActionState = {
    success: false,
    error: null,
  };

  const [response, action, isLoading] = useActionState(
    async (_: ActionState, formData: FormData): Promise<ActionState> => {
      try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await signIn.email({
          email,
          password,
        });

        if (res.error) {
          return {
            success: false,
            error: res.error.message ?? "Invalid credentials",
          };
        }

        return {
          success: true,
          error: null,
        };
      } catch (err) {
        console.error(err);

        return {
          success: false,
          error: "Something went wrong",
        };
      }
    },
    initialState
  );

  if (session.data?.session) {
    return <Navigate to="/" replace />;
  }

  console.log(response);
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
            <span className="text-3xl">🔥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your HotDrop account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form action={action} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />

            {response?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {response.error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-orange-500 font-medium hover:text-orange-600"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
