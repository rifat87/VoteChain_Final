import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface FaceCaptureProps {
  nid: string;
  onCaptureComplete: (success: boolean) => void;
}

export function FaceCapture({ nid, onCaptureComplete }: FaceCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!nid) {
      toast({
        title: "Error",
        description: "Please enter NID before capturing face",
        variant: "destructive",
      });
      return;
    }

    setIsCapturing(true);
    try {
      const response = await fetch('http://localhost:5000/api/biometric/capture-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nid }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Face captured successfully",
        });
        onCaptureComplete(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to capture face",
          variant: "destructive",
        });
        onCaptureComplete(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to face capture service",
        variant: "destructive",
      });
      onCaptureComplete(false);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={handleCapture}
        disabled={isCapturing || !nid}
        className="w-full"
      >
        {isCapturing ? "Capturing..." : "Capture Face"}
      </Button>
      {isCapturing && (
        <p className="text-sm text-muted-foreground">
          Please look at the camera and wait for the capture to complete...
        </p>
      )}
    </div>
  );
} 