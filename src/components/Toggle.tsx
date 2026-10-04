"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-[4px] shrink-0 border-0 p-0 cursor-pointer
                        transition-colors ${
                          checked ? "bg-[#9C5B33]" : "bg-[#2A1F16]/20"
                        }`}
    >
      <span
        className="absolute left-0.5 top-0.5 h-4 w-4 rounded-[3px] bg-white shadow-sm transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
      />
    </button>
  );
}
