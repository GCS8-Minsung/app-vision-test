"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, DragEvent, FormEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CloudUpload, ImagePlus, Shield, Undo2, X } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { UPLOAD_TYPE_LABELS } from "@/lib/constants";
import { createId } from "@/lib/ids";
import { extractMedicationInfo } from "@/lib/ocr";
import { draftStorage, storage } from "@/lib/storage";
import type { UploadType } from "@/lib/types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

interface MaskBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function dataUrlToFile(dataUrl: string, fileName: string): File {
  const [meta, base64] = dataUrl.split(",");
  const mimeType = meta.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName.replace(/\.[^.]+$/, "-masked.jpg"), { type: mimeType });
}

function applyMasks(dataUrl: string, masks: MaskBox[], fileName: string): Promise<{ dataUrl: string; file: File }> {
  if (masks.length === 0) {
    return Promise.resolve({ dataUrl, file: dataUrlToFile(dataUrl, fileName) });
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("이미지 마스킹을 처리할 수 없습니다."));
        return;
      }
      context.drawImage(image, 0, 0);
      context.fillStyle = "#050505";
      masks.forEach((mask) => {
        context.fillRect(
          (mask.x / 100) * canvas.width,
          (mask.y / 100) * canvas.height,
          (mask.width / 100) * canvas.width,
          (mask.height / 100) * canvas.height
        );
      });
      const masked = canvas.toDataURL("image/jpeg", 0.92);
      resolve({ dataUrl: masked, file: dataUrlToFile(masked, fileName) });
    };
    image.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    image.src = dataUrl;
  });
}

export default function UploadPage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState<UploadType>("medicine_package");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [maskMode, setMaskMode] = useState(false);
  const [masks, setMasks] = useState<MaskBox[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => undefined);
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  async function handleSelectedFile(nextFile: File | null) {
    setError("");
    setOcrStatus("");

    if (!nextFile) {
      setFile(null);
      setPreview("");
      setMasks([]);
      return;
    }

    const isImage = nextFile.type.startsWith("image/") || /\.(png|jpe?g|heic|heif|webp)$/i.test(nextFile.name);
    if (!isImage) {
      setFile(null);
      setPreview("");
      setMasks([]);
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setFile(nextFile);
    setPreview(await fileToDataUrl(nextFile));
    setMasks([]);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    await handleSelectedFile(event.target.files?.[0] ?? null);
  }

  function stopCamera() {
    cameraStream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
    setCameraOpen(false);
  }

  async function startCamera() {
    setError("");
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("이 브라우저에서는 직접 촬영을 지원하지 않습니다. 이미지 선택을 사용해주세요.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1600 },
          height: { ideal: 1200 }
        },
        audio: false
      });
      setCameraStream(stream);
      setCameraOpen(true);
    } catch {
      setCameraError("카메라를 열 수 없습니다. 브라우저 권한 또는 장치 연결 상태를 확인해주세요.");
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("카메라 화면이 준비되지 않았습니다. 잠시 후 다시 촬영해주세요.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("촬영 이미지를 처리할 수 없습니다.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const capturedFile = dataUrlToFile(capturedDataUrl, `clean-check-camera-${Date.now()}.jpg`);
    await handleSelectedFile(capturedFile);
    stopCamera();
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDragging(false);
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    await handleSelectedFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const profile = storage.getProfile();
    if (!profile) { router.push("/onboarding"); return; }
    if (!file || !preview) { setError("업로드할 이미지를 선택해주세요."); return; }
    setSubmitting(true);
    setOcrStatus("이미지에서 글자를 읽는 중입니다. 잠시만 기다려주세요.");
    const uploadId = createId("upload");
    const masked = await applyMasks(preview, masks, file.name);
    storage.saveUpload({
      id: uploadId, userId: profile.id, uploadType,
      imageDataUrl: masked.dataUrl, fileName: masked.file.name, createdAt: new Date().toISOString()
    });
    draftStorage.saveDraftUploadId(uploadId);
    const extracted = await extractMedicationInfo(masked.file);
    draftStorage.saveDraftOcr(extracted);
    router.push("/review");
  }

  function handleMaskClick(event: MouseEvent<HTMLDivElement>) {
    if (!maskMode) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setMasks((current) => [
      ...current,
      {
        id: createId("mask"),
        x: Math.max(0, Math.min(82, x - 9)),
        y: Math.max(0, Math.min(90, y - 5)),
        width: 18,
        height: 10
      }
    ]);
  }

  return (
    <main className="flow-shell">
      <StepIndicator current={1} />

      <div className="section-card mt-2 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#e6e0e9] mb-1">이미지 업로드</h1>
          <p className="text-sm text-[#cbc4d2]">처방전, 약 봉투, 성분표를 사진으로 등록하세요.</p>
        </div>

        {/* Privacy warning */}
        <div
          className="flex gap-3 items-start rounded-xl p-3 text-sm"
          style={{ background: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.25)" }}
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: "#ffb4ab" }} />
          <p className="text-[#ffb4ab]">
            주민번호, 카드번호, 주소 등 민감정보가 보이면 업로드 전 가려주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label htmlFor="uploadType" className="form-label">이미지 유형 선택</label>
            <select
              id="uploadType"
              data-testid="upload-type-select"
              className="form-input"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as UploadType)}
              style={{ backgroundImage: "none" }}
            >
              {Object.entries(UPLOAD_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Drop zone / file input */}
          <div>
            <label htmlFor="file" className="form-label">이미지 파일</label>
            {!preview ? (
              <label
                htmlFor="file"
                data-testid="drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center transition-colors hover:border-[#7c4dff]"
                style={{
                  background: isDragging ? "rgba(124, 77, 255, 0.14)" : "#1e262d",
                  border: isDragging ? "2px dashed #cfbcff" : "2px dashed #3d4a56",
                  minHeight: "180px"
                }}
              >
                <div
                  className="flex size-16 items-center justify-center rounded-full"
                  style={{ background: "rgba(124, 77, 255, 0.1)" }}
                >
                  <CloudUpload size={28} style={{ color: "#cfbcff" }} />
                </div>
                <div>
                  <p className="font-medium text-[#e6e0e9]">
                    {isDragging ? "여기에 놓으면 첨부됩니다" : "이미지를 여기에 놓으세요"}
                  </p>
                  <p className="mt-1 text-xs text-[#948e9c]">또는 클릭하여 선택 · PNG, JPG, HEIC, WEBP</p>
                </div>
              </label>
            ) : null}
            <input
              id="file"
              data-testid="file-input"
              className={preview ? "form-input" : "sr-only"}
              type="file"
              accept="image/*"
              onChange={handleFile}
            />
          </div>

          {cameraOpen && (
            <div
              className="space-y-3 rounded-2xl p-3"
              style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#e6e0e9]">카메라 촬영</p>
                <button
                  data-testid="camera-close"
                  type="button"
                  className="secondary-button px-3"
                  onClick={stopCamera}
                >
                  <X size={16} aria-hidden="true" />
                  닫기
                </button>
              </div>
              <video
                ref={videoRef}
                className="aspect-[4/3] w-full rounded-xl bg-black object-contain"
                autoPlay
                playsInline
                muted
                aria-label="카메라 미리보기"
              />
              <button
                data-testid="camera-capture"
                type="button"
                className="primary-button w-full"
                onClick={capturePhoto}
              >
                <Camera size={18} aria-hidden="true" />
                사진 촬영
              </button>
            </div>
          )}

          {preview && (
            <div className="space-y-3">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
                onClick={handleMaskClick}
              >
                <img
                  src={preview}
                  alt="업로드 이미지 미리보기"
                  className="block w-full"
                  style={{ maxHeight: 360, objectFit: "contain" }}
                />
                {masks.map((mask) => (
                  <span
                    key={mask.id}
                    aria-hidden="true"
                    className="absolute rounded-sm"
                    style={{
                      left: `${mask.x}%`,
                      top: `${mask.y}%`,
                      width: `${mask.width}%`,
                      height: `${mask.height}%`,
                      background: "#050505",
                      border: "1px solid rgba(255,255,255,0.35)"
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-[#948e9c]">{file?.name}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setMaskMode((current) => !current)}
                >
                  <Shield size={17} aria-hidden="true" />
                  {maskMode ? "가림 위치 선택 중" : "가림 박스 추가"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setMasks((current) => current.slice(0, -1))}
                  disabled={masks.length === 0}
                >
                  <Undo2 size={17} aria-hidden="true" />
                  마지막 가림 취소
                </button>
              </div>
              {maskMode && (
                <p className="text-xs text-[#cbc4d2]">
                  이미지에서 가릴 위치를 탭하면 검은 박스가 추가됩니다.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <label
              htmlFor="file"
              className="secondary-button flex cursor-pointer items-center justify-center gap-2 text-center"
              data-testid="file-select-button"
            >
              <ImagePlus size={18} aria-hidden="true" />
              이미지 선택
            </label>
            <button
              type="button"
              className="secondary-button flex items-center justify-center gap-2 text-center"
              data-testid="camera-button"
              onClick={startCamera}
            >
              <Camera size={18} aria-hidden="true" />
              카메라로 촬영
            </button>
          </div>

          {cameraError && (
            <p className="text-sm font-semibold" style={{ color: "#ffb4ab" }}>{cameraError}</p>
          )}

          {ocrStatus && (
            <div
              className="rounded-xl p-3 text-sm font-medium text-[#cfbcff]"
              style={{ background: "rgba(207, 188, 255, 0.08)", border: "1px solid rgba(207, 188, 255, 0.2)" }}
              role="status"
            >
              {ocrStatus}
            </div>
          )}

          {error && (
            <p className="text-sm font-semibold" style={{ color: "#ffb4ab" }}>{error}</p>
          )}

          <button
            data-testid="upload-submit"
            type="submit"
            className="primary-button w-full"
            disabled={submitting}
          >
            {submitting ? "문자 인식 중…" : "분석 정보 입력하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
