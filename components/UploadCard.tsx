import Image from "next/image";

export function UploadCard({ preview, fileName }: { preview: string; fileName?: string }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={preview} alt="업로드 이미지 미리보기" fill className="object-cover opacity-90" unoptimized />
      </div>
      {fileName && (
        <p
          className="px-4 py-2.5 text-xs text-[#948e9c] border-t"
          style={{ borderColor: "#3d4a56", fontFamily: "JetBrains Mono, monospace" }}
        >
          {fileName}
        </p>
      )}
    </div>
  );
}
