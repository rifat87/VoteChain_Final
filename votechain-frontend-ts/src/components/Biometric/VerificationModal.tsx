import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ScanFace, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when verification succeeds. Returns the verified voter's NID. */
  onVerified: (voterNid: string) => void;
}

export function VerificationModal({ open, onClose, onVerified }: VerificationModalProps) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verifyFace() {
    setError(null);
    setIsVerifying(true);
    try {
      const res = await fetch("http://localhost:5000/api/votes/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Face verification failed");
      }
      toast({ title: "✅ Face Verified", description: `NID: ${data.voter?.nationalId || "unknown"}` });
      onVerified(data.voter?.nationalId || "");
      onClose();
    } catch (err) {
      console.error("Face verification error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsVerifying(false);
    }
  }

  async function verifyFingerprint() {
    setError(null);
    setIsVerifying(true);
    try {
      const detectRes = await fetch("http://localhost:5000/api/biometric/fingerprint/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const detectData = await detectRes.json();
      if (!detectRes.ok || !detectData.success || !detectData.nid) {
        throw new Error(detectData.message || "Fingerprint detection failed");
      }

      toast({
        title: "✅ Fingerprint Verified",
        description: `NID: ${detectData.nid}`,
      });

      onVerified(detectData.nid);
      onClose();
    } catch (err) {
      console.error("Fingerprint verification error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Biometric Verification</DialogTitle>
          <DialogDescription>
            Verify your identity before casting your vote.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive mb-2">{error}</p>
        )}

        <div className="flex flex-col gap-4">
          <Button
            variant="default"
            disabled={isVerifying}
            onClick={verifyFace}
            className="w-full flex items-center gap-2"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanFace className="h-4 w-4" />
            )}
            Verify with Face
          </Button>

          <Button
            variant="outline"
            disabled={isVerifying}
            onClick={verifyFingerprint}
            className="w-full flex items-center gap-2"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Fingerprint className="h-4 w-4" />
            )}
            Verify with Fingerprint
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
