import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FingerprintCaptureProps {
  onCapture: (data: string) => void;
  onRetake: () => void;
  isCaptured: boolean;
}

export function FingerprintCapture({ onCapture, onRetake, isCaptured }: FingerprintCaptureProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fingerprint Capture</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            {isCaptured ? (
              <div className="text-center">
                <p className="text-muted-foreground">Fingerprint captured successfully</p>
                <Button variant="outline" onClick={onRetake} className="mt-2">
                  Retake
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Place finger on sensor</p>
            )}
          </div>
          {!isCaptured && (
            <Button onClick={() => onCapture("dummy-fingerprint-data")} className="w-full">
              Capture Fingerprint
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 