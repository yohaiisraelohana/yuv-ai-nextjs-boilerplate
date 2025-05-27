"use client";

import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  className?: string;
}

export function SignaturePad({
  onSignatureChange,
  className,
}: SignaturePadProps) {
  const signaturePadRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const handleResize = () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEnd = () => {
    if (signaturePadRef.current) {
      const signature = signaturePadRef.current.toDataURL();
      onSignatureChange(signature);
    }
  };

  return (
    <div className={className}>
      <SignatureCanvas
        ref={signaturePadRef}
        canvasProps={{
          className: "w-full h-48",
        }}
        onEnd={handleEnd}
      />
    </div>
  );
}
