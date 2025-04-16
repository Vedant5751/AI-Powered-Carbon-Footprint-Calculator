"use client";

import { signIn, getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const error = searchParams?.get("error");

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        window.location.href = "/dashboard";
      }
    };
    checkSession();
  }, []);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className=" flex items-center justify-center min-h-[calc(100vh-8rem)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="EcoTrack Logo"
                width={40}
                height={40}
              />
              <span className="font-bold text-xl">EcoTrack</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to EcoTrack
          </CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
          {error && (
            <p className="text-sm font-medium text-red-500">
              {error === "OAuthSignin" && "Error starting the sign in process."}
              {error === "OAuthCallback" &&
                "Error completing the sign in process."}
              {error === "OAuthAccountNotLinked" &&
                "Email already used with a different provider."}
              {error === "default" &&
                "An error occurred during authentication."}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-medium"
              onClick={handleGoogleSignIn}
            >
              Sign up with Google
            </Button>
          </p>
          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
