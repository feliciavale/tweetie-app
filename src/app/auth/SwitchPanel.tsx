interface SwitchPanelProps {
  mode: "signup" | "signin";
  onSwitch: (mode: "signup" | "signin") => void;
}

export default function SwitchPanel({ mode, onSwitch }: SwitchPanelProps) {
  const isSignIn = mode === "signin";

  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-11 h-11 rounded-md bg-[#2A1F16] flex items-center justify-center">
        <span className="font-display text-lg text-white">T</span>
      </div>

      <p className="font-display text-2xl text-[#2A1F16]">Tweetie</p>
      <p className="text-sm text-[#6B5842] leading-relaxed max-w-[220px]">
        {isSignIn
          ? "New here? Create an account to start posting."
          : "Already have an account? Sign in to continue."}
      </p>

      <button
        onClick={() => onSwitch(isSignIn ? "signup" : "signin")}
        className="px-6 py-2 rounded-md border border-[#2A1F16] text-[#2A1F16] text-sm font-medium hover:bg-[#2A1F16] hover:text-white transition-colors duration-200"
      >
        {isSignIn ? "Sign up" : "Sign in"}
      </button>
    </div>
  );
}
