"use client";

import authClient from "@/auth/authClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Github, Package } from "lucide-react";
import { useState } from "react";

export default function Home() {
    const { data: session, error: sessionError } = authClient.useSession();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isAuthActionInProgress, setIsAuthActionInProgress] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSendOTP = async () => {
        if (!email) {
            setErrorMessage("Please enter your email address");
            return;
        }

        setIsAuthActionInProgress(true);
        setErrorMessage("");

        try {
            const result = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "sign-in",
            });

            if (result.error) {
                setErrorMessage(result.error.message || "Failed to send OTP");
            } else {
                setOtpSent(true);
            }
        } catch (e: any) {
            setErrorMessage(e.message || "An unexpected error occurred");
        } finally {
            setIsAuthActionInProgress(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setErrorMessage("Please enter a valid 6-digit code");
            return;
        }

        setIsAuthActionInProgress(true);
        setErrorMessage("");

        try {
            const result = await authClient.signIn.emailOtp({
                email,
                otp,
            });

            if (result.error) {
                setErrorMessage(result.error.message || "Invalid OTP");
            } else {
                // Login succeeded - middleware will handle redirect to dashboard
                // Force a page refresh to trigger middleware redirect
                window.location.reload();
            }
        } catch (e: any) {
            setErrorMessage(e.message || "An unexpected error occurred");
        } finally {
            setIsAuthActionInProgress(false);
        }
    };

    const handleReset = () => {
        setOtpSent(false);
        setOtp("");
        setErrorMessage("");
    };

    if (sessionError) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Error loading session: {sessionError.message}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Sign in with your email address</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {!otpSent ? (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={isAuthActionInProgress}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleSendOTP();
                                        }
                                    }}
                                />
                            </div>
                            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                        </>
                    ) : (
                        <>
                            <div className="grid gap-2">
                                <Label>Verification Code</Label>
                                <p className="text-sm text-gray-600">We sent a 6-digit code to {email}</p>
                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={setOtp}
                                        disabled={isAuthActionInProgress}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>
                            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                            <Button
                                variant="link"
                                onClick={handleReset}
                                className="text-sm"
                                disabled={isAuthActionInProgress}
                            >
                                Use a different email
                            </Button>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    {!otpSent ? (
                        <Button onClick={handleSendOTP} className="w-full" disabled={isAuthActionInProgress}>
                            {isAuthActionInProgress ? "Sending..." : "Send Code"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleVerifyOTP}
                            className="w-full"
                            disabled={isAuthActionInProgress || otp.length !== 6}
                        >
                            {isAuthActionInProgress ? "Verifying..." : "Verify & Sign In"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
            <footer className="absolute bottom-0 w-full text-center text-sm text-gray-500 py-4">
                <div className="space-y-3">
                    <div>Powered by better-auth-cloudflare</div>
                    <div className="flex items-center justify-center gap-4">
                        <a
                            href="https://github.com/zpg6/better-auth-cloudflare"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                        >
                            <Github size={16} />
                            <span>GitHub</span>
                        </a>
                        <a
                            href="https://www.npmjs.com/package/better-auth-cloudflare"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                        >
                            <Package size={16} />
                            <span>npm</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
