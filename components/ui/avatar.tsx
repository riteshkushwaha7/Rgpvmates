import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  image,
  className,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name || "Profile"}
        width={80}
        height={80}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700", className)}>
      {initials(name)}
    </div>
  );
}
