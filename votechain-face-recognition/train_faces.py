import face_recognition
import os
import pickle

dataset_path = 'dataset'
encoding_file = 'face_encodings.pkl'

face_encodings = []
face_ids = []
face_names = []

# Load and encode faces
for file in os.listdir(dataset_path):
    image_path = os.path.join(dataset_path, file)
    print(f"Processing {image_path}")  # Debug statement

    try:
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)

        if encodings:
            # Extract user ID and name from the filename
            user_id, user_name, _ = file.split('_')
            face_encodings.append(encodings[0])
            face_ids.append(user_id)
            face_names.append(user_name)
        else:
            print(f"No face detected in {image_path}")  # Debug statement
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Save encodings to file
if face_encodings:
    data = {"encodings": face_encodings, "ids": face_ids, "names": face_names}
    with open(encoding_file, 'wb') as f:
        pickle.dump(data, f)
    print("Face recognition model trained!")
else:
    print("No faces detected. Ensure the dataset contains valid images.")