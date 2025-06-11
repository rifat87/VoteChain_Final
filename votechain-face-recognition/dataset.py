import cv2
import os
import sys
import time

def capture_face(nid):
    # Create dataset directory inside votechain-face-recognition
    base_path = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_path, 'dataset')
    
    # Ensure dataset directory exists
    if not os.path.exists(dataset_path):
        os.makedirs(dataset_path)
        print(f"Created dataset directory at: {dataset_path}")

    # Create directory for this NID
    nid_path = os.path.join(dataset_path, str(nid))
    if not os.path.exists(nid_path):
        os.makedirs(nid_path)
        print(f"Created NID directory at: {nid_path}")

    # Initialize Camera
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        print("Error: Could not open camera")
        return False

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    img_count = 0
    last_capture_time = 0
    capture_interval = 2  # 2 seconds between captures

    try:
        print("Starting face capture process...")
        print("Please position your face in the center of the frame")
        time.sleep(2)  # Give user time to prepare

        while img_count < 5:  # Capture 5 images
            ret, frame = camera.read()
            if not ret:
                print("Failed to capture image from camera")
                return False

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)

            current_time = time.time()
            
            # Draw rectangle around detected face
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                
                # Only capture if enough time has passed since last capture
                if current_time - last_capture_time >= capture_interval:
                    img_count += 1
                    face_img = gray[y:y+h, x:x+w]  # Cropped grayscale face image
                    face_img_rgb = cv2.cvtColor(face_img, cv2.COLOR_GRAY2RGB)

                    # Save the face image with NID in the filename
                    image_path = os.path.join(nid_path, f"{nid}_{img_count}.jpg")
                    cv2.imwrite(image_path, face_img_rgb)
                    print(f"Captured image {img_count}/5 at: {image_path}")
                    last_capture_time = current_time

            # Display countdown if waiting for next capture
            if img_count < 5:
                time_until_next = max(0, capture_interval - (current_time - last_capture_time))
                countdown = int(time_until_next) + 1
                cv2.putText(frame, f"Next capture in: {countdown}s", (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            cv2.imshow("Face Capture", frame)
            key = cv2.waitKey(1) & 0xFF
            
            # Break if 'q' is pressed
            if key == ord('q'):
                print("Face capture process interrupted by user")
                return False

            if img_count >= 5:
                print("Face capture completed successfully!")
                return True

    except Exception as e:
        print(f"Error during face capture: {str(e)}")
        return False
    finally:
        camera.release()
        cv2.destroyAllWindows()

    return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 dataset.py <nid>")
        sys.exit(1)
    
    nid = sys.argv[1]
    success = capture_face(nid)
    sys.exit(0 if success else 1)