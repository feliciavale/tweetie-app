interface AvatarProps {
  name: string;
  size?: number;
  src?: string | null;
}

export default function Avatar({ name, size = 40, src }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-[#2A1F16] flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span
        className="font-display text-white"
        style={{ fontSize: size * 0.4 }}
      >
        {initial}
      </span>
    </div>
  );
}
