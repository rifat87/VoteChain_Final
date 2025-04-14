import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FaceCaptureProps {
  onCapture: (image: string) => void;
  onRetake: () => void;
  isCaptured: boolean;
}

export function FaceCapture({ onCapture, onRetake, isCaptured }: FaceCaptureProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Face Capture</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            {isCaptured ? (
              <div className="text-center">
                <p className="text-muted-foreground">Face captured successfully</p>
                <Button variant="outline" onClick={onRetake} className="mt-2">
                  Retake
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Camera feed will appear here</p>
            )}
          </div>
          {!isCaptured && (
            <Button onClick={() => onCapture("dummy-image-data")} className="w-full">
              Capture Face
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 