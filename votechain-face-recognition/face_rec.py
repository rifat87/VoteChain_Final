import cv2
import face_recognition
import pickle

# Load face encodings
encoding_file = 'face_encodings.pkl'
with open(encoding_file, 'rb') as f:
    data = pickle.load(f)

# Initialize camera
camera = cv2.VideoCapture(0)

# Reduce frame size for faster processing
frame_width = 640
frame_height = 480
camera.set(cv2.CAP_PROP_FRAME_WIDTH, frame_width)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, frame_height)

# Precompute known face encodings, IDs, and names
known_face_encodings = data["encodings"]
known_face_ids = data["ids"]
known_face_names = data["names"]

while True:
    ret, frame = camera.read()
    if not ret:
        print("Failed to capture frame from camera.")
        break

    # Resize frame for faster processing
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    # Detect face locations and encodings
    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        # Scale face locations back to original frame size
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        # Compare face with known faces
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        name = "Unknown"
        user_id = "Unknown"

        # Use the first match if any
        if True in matches:
            match_index = matches.index(True)
            user_id = known_face_ids[match_index]
            name = known_face_names[match_index]

        # Display user ID and name
        label = f"ID:{user_id}, Name: {name}"
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
        cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)

    # Display the resulting frame
    cv2.imshow("Face Recognition", frame)

    # Exit on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release camera and close windows
camera.release()
cv2.destroyAllWindows()