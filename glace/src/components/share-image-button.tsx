"use client";

import { Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Comparte una imagen con el menú del sistema (WhatsApp, etc.); si no se puede, la descarga. */
export function ShareImageButton({
  src,
  fileName,
  title,
  text,
  children,
}: {
  src: string;
  fileName: string;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  const share = async () => {
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], fileName, { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Imagen descargada. Ya podés enviarla por WhatsApp.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("No pudimos compartir la imagen. Probá de nuevo.");
    }
  };

  return (
    <Button variant="outline" size="xl" onClick={share} className="rounded-full bg-card">
      <Share2Icon aria-hidden="true" />
      {children}
    </Button>
  );
}
