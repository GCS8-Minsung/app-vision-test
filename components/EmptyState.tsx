import Link from "next/link";
import { PlusCircle } from "lucide-react";

export function EmptyState({ message, href, action }: { message: string; href: string; action: string }) {
  return (
    <div
      className="rounded-3xl p-8 text-center"
      style={{
        background: "#303b45",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
      }}
    >
      <div
        className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full"
        style={{ background: "rgba(124, 77, 255, 0.12)" }}
      >
        <PlusCircle size={28} className="text-[#cfbcff]" aria-hidden="true" />
      </div>
      <p className="mb-5 text-[#cbc4d2]">{message}</p>
      <Link href={href} className="primary-button">
        <PlusCircle size={16} aria-hidden="true" />
        {action}
      </Link>
    </div>
  );
}
