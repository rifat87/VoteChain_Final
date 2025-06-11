import face_recognition
import os
import pickle

# Get absolute paths
base_path = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(base_path, 'dataset')
encoding_file = os.path.join(base_path, 'face_encodings.pkl')

face_encodings = []
face_ids = []
face_names = []

print("Starting face training process...")
print(f"Dataset path: {dataset_path}")

# Load and encode faces
for nid_dir in os.listdir(dataset_path):
    nid_path = os.path.join(dataset_path, nid_dir)
    if os.path.isdir(nid_path):
        print(f"Processing NID directory: {nid_dir}")
        for image_file in os.listdir(nid_path):
            if image_file.endswith('.jpg'):
                image_path = os.path.join(nid_path, image_file)
                print(f"Processing image: {image_path}")

                try:
                    image = face_recognition.load_image_file(image_path)
                    encodings = face_recognition.face_encodings(image)

                    if encodings:
                        # Extract NID from the directory name
                        face_encodings.append(encodings[0])
                        face_ids.append(nid_dir)  # Use NID as the ID
                        face_names.append(nid_dir)  # Use NID as the name for now
                        print(f"Successfully encoded face for NID: {nid_dir}")
                    else:
                        print(f"No face detected in {image_path}")
                except Exception as e:
                    print(f"Error processing {image_path}: {e}")

# Save encodings to file
if face_encodings:
    data = {"encodings": face_encodings, "ids": face_ids, "names": face_names}
    with open(encoding_file, 'wb') as f:
        pickle.dump(data, f)
    print("Face recognition model trained successfully!")
    print(f"Encodings saved to: {encoding_file}")
else:
    print("No faces detected. Ensure the dataset contains valid images.")