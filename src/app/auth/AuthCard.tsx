"use client";

import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import SwitchPanel from "./SwitchPanel";

export default function AuthCard() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [justRegisteredEmail, setJustRegisteredEmail] = useState<string | null>(
    null,
  );
  const isSignIn = mode === "signin";

  function handleSignUpSuccess(email: string) {
    setJustRegisteredEmail(email);
    setMode("signin");
  }

  function handleSwitch(newMode: "signup" | "signin") {
    // Clear the success message if the user manually navigates away from sign-in
    if (newMode !== "signin") setJustRegisteredEmail(null);
    setMode(newMode);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2A1F16] px-4">
      <div className="w-full max-w-[760px] h-[440px] rounded-2xl shadow-xl relative flex">
        <div className="w-1/2 h-full bg-[#CBB595] rounded-l-2xl overflow-hidden">
          <SignInForm
            successMessage={
              justRegisteredEmail
                ? "Account created! Sign in with your new credentials to continue."
                : undefined
            }
            initialEmail={justRegisteredEmail ?? undefined}
          />
        </div>

        <div className="w-1/2 h-full bg-[#CBB595] rounded-r-2xl overflow-hidden">
          <SignUpForm onSuccess={handleSignUpSuccess} />
        </div>

        <div
          className="absolute top-0 left-0 w-1/2 h-full rounded-2xl bg-white flex items-center justify-center px-10"
          style={{
            transform: isSignIn ? "translateX(100%)" : "translateX(0%)",
            transition: "transform 600ms cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        >
          <SwitchPanel mode={mode} onSwitch={handleSwitch} />
        </div>
      </div>
    </div>
  );
}
