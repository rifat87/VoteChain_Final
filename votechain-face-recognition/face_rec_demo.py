#!/usr/bin/env python3
"""
Face Recognition Demo Script
- Auto-exits after recognition or timeout
- Provides clean text output for backend parsing
- No GUI windows
- Handles camera access gracefully
"""

import cv2
import face_recognition
import pickle
import sys
import time
import os
from contextlib import contextmanager

# Configuration
TIMEOUT_SECONDS = 10  # Auto-exit after 10 seconds
MAX_FRAMES = 30       # Maximum frames to process
CONFIDENCE_THRESHOLD = 0.6  # Face match confidence

@contextmanager
def camera_context():
    """Context manager for camera handling"""
    camera = None
    try:
        print("DEMO: Initializing camera...")
        camera = cv2.VideoCapture(0)
        
        if not camera.isOpened():
            raise Exception("Cannot access camera. Please check permissions.")
        
        # Configure camera
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 30)
        
        print("DEMO: Camera initialized successfully")
        yield camera
        
    except Exception as e:
        print(f"DEMO: Camera error: {e}")
        raise
    finally:
        if camera:
            camera.release()
            print("DEMO: Camera released")

def load_face_encodings():
    """Load trained face encodings"""
    try:
        encoding_file = 'face_encodings.pkl'
        if not os.path.exists(encoding_file):
            print("DEMO: ERROR - No trained face encodings found")
            print("DEMO: Please train faces first using the Train Face button")
            return None, None, None
            
        with open(encoding_file, 'rb') as f:
            data = pickle.load(f)
            
        print(f"DEMO: Loaded {len(data['encodings'])} trained faces")
        return data["encodings"], data["ids"], data["names"]
        
    except Exception as e:
        print(f"DEMO: ERROR loading face encodings: {e}")
        return None, None, None

def recognize_face():
    """Main face recognition function with timeout and auto-exit"""
    print("DEMO: Starting face recognition process...")
    
    # Load face encodings
    known_encodings, known_ids, known_names = load_face_encodings()
    if known_encodings is None:
        return False
    
    start_time = time.time()
    frame_count = 0
    recognition_found = False
    
    try:
        with camera_context() as camera:
            print("DEMO: Looking for faces... (10 second timeout)")
            
            while frame_count < MAX_FRAMES:
                # Check timeout
                if time.time() - start_time > TIMEOUT_SECONDS:
                    print("DEMO: Timeout reached - no face recognized")
                    break
                
                ret, frame = camera.read()
                if not ret:
                    print("DEMO: Failed to capture frame")
                    continue
                
                frame_count += 1
                
                # Process every 3rd frame for performance
                if frame_count % 3 != 0:
                    continue
                
                # Resize for faster processing
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
                
                # Detect faces
                face_locations = face_recognition.face_locations(rgb_frame)
                if not face_locations:
                    print("DEMO: No face detected in frame")
                    continue
                
                print(f"DEMO: Found {len(face_locations)} face(s) in frame")
                
                # Get face encodings
                face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                
                for face_encoding in face_encodings:
                    # Compare with known faces
                    distances = face_recognition.face_distance(known_encodings, face_encoding)
                    matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=CONFIDENCE_THRESHOLD)
                    
                    if True in matches:
                        match_index = matches.index(True)
                        confidence = 1 - distances[match_index]
                        
                        user_id = known_ids[match_index]
                        name = known_names[match_index]
                        
                        print("DEMO: FACE RECOGNITION SUCCESSFUL!")
                        print(f"DEMO: Matched ID: {user_id}")
                        print(f"DEMO: Matched Name: {name}")
                        print(f"DEMO: Confidence: {confidence:.2%}")
                        print("DEMO: Identity verified successfully")
                        
                        recognition_found = True
                        return True
                    else:
                        min_distance = min(distances)
                        print(f"DEMO: Face detected but no match (closest distance: {min_distance:.2f})")
                
                # Small delay to prevent CPU overload
                time.sleep(0.1)
            
            if not recognition_found:
                print("DEMO: No matching face found")
                print("DEMO: Please ensure you are registered and trained")
                return False
                
    except KeyboardInterrupt:
        print("DEMO: Process interrupted by user")
        return False
    except Exception as e:
        print(f"DEMO: ERROR during recognition: {e}")
        return False

def main():
    """Main entry point"""
    try:
        print("DEMO: Face Recognition System Starting...")
        print("DEMO: Version: Auto-exit Demo")
        
        success = recognize_face()
        
        if success:
            print("DEMO: RESULT = SUCCESS")
            sys.exit(0)  # Success exit code
        else:
            print("DEMO: RESULT = FAILED")
            sys.exit(1)  # Failure exit code
            
    except Exception as e:
        print(f"DEMO: CRITICAL ERROR: {e}")
        sys.exit(2)  # Critical error exit code

if __name__ == "__main__":
    main() 