# import face_recognition
# import os
# import pickle

# # Get absolute paths
# base_path = os.path.dirname(os.path.abspath(__file__))
# dataset_path = os.path.join(base_path, 'dataset')
# encoding_file = os.path.join(base_path, 'face_encodings.pkl')

# face_encodings = []
# face_ids = []
# face_names = []

# print("Starting face training process...")
# print(f"Dataset path: {dataset_path}")

# # Load and encode faces
# for nid_dir in os.listdir(dataset_path):
#     nid_path = os.path.join(dataset_path, nid_dir)
#     if os.path.isdir(nid_path):
#         print(f"Processing NID directory: {nid_dir}")
#         for image_file in os.listdir(nid_path):
#             if image_file.endswith('.jpg'):
#                 image_path = os.path.join(nid_path, image_file)
#                 print(f"Processing image: {image_path}")

#                 try:
#                     image = face_recognition.load_image_file(image_path)
#                     encodings = face_recognition.face_encodings(image)

#                     if encodings:
#                         # Extract NID from the directory name
#                         face_encodings.append(encodings[0])
#                         face_ids.append(nid_dir)  # Use NID as the ID
#                         face_names.append(nid_dir)  # Use NID as the name for now
#                         print(f"Successfully encoded face for NID: {nid_dir}")
#                     else:
#                         print(f"No face detected in {image_path}")
#                 except Exception as e:
#                     print(f"Error processing {image_path}: {e}")

# # Save encodings to file
# if face_encodings:
#     data = {"encodings": face_encodings, "ids": face_ids, "names": face_names}
#     with open(encoding_file, 'wb') as f:
#         pickle.dump(data, f)
#     print("Face recognition model trained successfully!")
#     print(f"Encodings saved to: {encoding_file}")
# else:
#     print("No faces detected. Ensure the dataset contains valid images.")

# import os
# import cv2
# import numpy as np
# import joblib
# from sklearn.linear_model import SGDClassifier
# from collections import defaultdict
# from insightface.app import FaceAnalysis

# # CONFIGURATION
# DATA_DIR   = "dataset"             # Root folder with subfolders per voter_id
# MODEL_PATH = "face_encodings.pkl"   # Path to save/load model+centroids

# # Initialize InsightFace (CPU-only)
# model = FaceAnalysis(name='buffalo_l')
# model.prepare(ctx_id=-1)


# def get_embeddings_for_ids(voter_ids, data_dir=DATA_DIR):
#     """
#     Extract embeddings for specified voter_ids from disk.
#     Returns:
#       X: np.ndarray of embeddings
#       y: np.ndarray of labels
#     """
#     X, y = [], []
#     for vid in voter_ids:
#         folder = os.path.join(data_dir, vid)
#         if not os.path.isdir(folder):
#             print(f"[DEBUG] Missing folder for voter ID '{vid}': {folder}")
#             continue
#         for fname in os.listdir(folder):
#             # Only consider common image types
#             if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
#                 print(f"[DEBUG] Skipping non-image file: {fname}")
#                 continue
#             path = os.path.join(folder, fname)
#             img = cv2.imread(path)
#             if img is None:
#                 print(f"[DEBUG] Failed to load image: {path}")
#                 continue
#             faces = model.get(img)
#             print(f"[DEBUG] {len(faces)} faces detected in {path}")
#             if not faces:
#                 continue
#             X.append(faces[0].embedding)
#             y.append(vid)
#     print(f"[DEBUG] Embeddings collected: X.shape={np.array(X).shape}, y.shape={np.array(y).shape}")
#     return np.array(X), np.array(y)


# def update_centroids(existing_centroids, X, y):
#     """
#     Given existing centroids and new embeddings X,y, compute updated centroids.
#     """
#     buckets = defaultdict(list)
#     # include previous centroid embeddings in buckets
#     for lbl, cent in existing_centroids.items():
#         buckets[lbl].append(cent)
#     # add new embeddings
#     for emb, lbl in zip(X, y):
#         buckets[lbl].append(emb)
#     # compute mean per label
#     new_centroids = {lbl: np.mean(embs, axis=0) for lbl, embs in buckets.items()}
#     return new_centroids


# def train_incrementally():
#     # 1) Load or initialize model
#     if os.path.exists(MODEL_PATH):
#         raw = joblib.load(MODEL_PATH)
#         if isinstance(raw, dict) and 'clf' in raw and 'centroids' in raw:
#             clf = raw['clf']
#             centroids = raw['centroids']
#             existing_ids = set(centroids.keys())
#             print(f"[INFO] Loaded existing model with classes: {sorted(existing_ids)}")
#         else:
#             clf = raw
#             centroids = {}
#             existing_ids = set(getattr(clf, 'classes_', []))
#             print(f"[INFO] Loaded legacy classifier with classes: {sorted(existing_ids)}")
#     else:
#         clf = SGDClassifier(loss='log_loss', max_iter=1000)
#         centroids = {}
#         existing_ids = set()
#         print("[INFO] No existing model found. Starting fresh.")

#     # 2) Identify voter IDs on disk
#     all_ids = {d for d in os.listdir(DATA_DIR)
#                if os.path.isdir(os.path.join(DATA_DIR, d))}
#     new_ids = sorted(all_ids - existing_ids)
#     print(f"[INFO] All IDs on disk: {sorted(all_ids)}")
#     print(f"[INFO] Existing IDs in model: {sorted(existing_ids)}")
#     print(f"[INFO] New IDs to train: {new_ids}")

#     # 3) If no new IDs, full retrain
#     if not new_ids:
#         print("[INFO] No new voters. Performing full retrain on all IDs.")
#         X_all, y_all = get_embeddings_for_ids(sorted(all_ids))
#         if len(X_all) == 0:
#             print("[ERROR] No embeddings found for any IDs. Aborting.")
#             return
#         clf = SGDClassifier(loss='log_loss', max_iter=1000)
#         clf.fit(X_all, y_all)
#         centroids = update_centroids({}, X_all, y_all)
#         joblib.dump({'clf': clf, 'centroids': centroids}, MODEL_PATH)
#         print(f"[INFO] Full retrain complete on {len(all_ids)} classes. Model saved.")
#         return

#     # 4) Extract and train on new IDs only
#     X_new, y_new = get_embeddings_for_ids(new_ids)
#     if len(X_new) == 0:
#         print("[ERROR] Could not extract embeddings for new IDs. Aborting incremental training.")
#         return
#     all_classes = np.array(sorted(existing_ids | set(new_ids)))
#     clf.partial_fit(X_new, y_new, classes=all_classes)
#     print(f"[INFO] incremental partial_fit on new IDs: {new_ids}")

#     # 5) Update centroids
#     centroids = update_centroids(centroids, X_new, y_new)
#     print(f"[INFO] Centroids updated for IDs: {new_ids}")

#     # 6) Save updated model
#     joblib.dump({'clf': clf, 'centroids': centroids}, MODEL_PATH)
#     print(f"[INFO] Incremental model saved to {MODEL_PATH}.")

# if __name__ == '__main__':
#     train_incrementally()

import os
import cv2
import numpy as np
import joblib
from sklearn.linear_model import SGDClassifier
from collections import defaultdict
from insightface.app import FaceAnalysis

# CONFIGURATION
DATA_DIR = "dataset"
MODEL_PATH = "face_encodings.pkl"

# Initialize InsightFace
model = FaceAnalysis(name='buffalo_l')
model.prepare(ctx_id=-1)

def get_embeddings_for_ids(voter_ids, data_dir=DATA_DIR):
    X, y = [], []
    for vid in voter_ids:
        folder = os.path.join(data_dir, vid)
        if not os.path.isdir(folder):
            continue
        for fname in os.listdir(folder):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            path = os.path.join(folder, fname)
            img = cv2.imread(path)
            if img is None:
                continue
            faces = model.get(img)
            if not faces:
                continue
            X.append(faces[0].embedding)
            y.append(vid)
    return np.array(X), np.array(y)

def update_centroids(existing_centroids, X, y):
    buckets = defaultdict(list)
    for lbl, cent in existing_centroids.items():
        buckets[lbl].append(cent)
    for emb, lbl in zip(X, y):
        buckets[lbl].append(emb)
    return {lbl: np.mean(embs, axis=0) for lbl, embs in buckets.items()}

def train_incrementally():
    # 1. Load existing model (if exists)
    if os.path.exists(MODEL_PATH):
        raw = joblib.load(MODEL_PATH)
        if isinstance(raw, dict):
            clf = raw['clf']
            centroids = raw['centroids']
            previous_classes = raw.get('classes', sorted(centroids.keys()))
            print(f"[INFO] Loaded model with classes: {previous_classes}")
        else:
            clf = raw
            centroids = {}
            previous_classes = sorted(getattr(clf, 'classes_', []))
    else:
        clf = SGDClassifier(loss='log_loss', max_iter=1000)
        centroids = {}
        previous_classes = []

    # 2. Scan current voter folders
    all_ids = sorted([d for d in os.listdir(DATA_DIR)
                      if os.path.isdir(os.path.join(DATA_DIR, d))])
    if not all_ids:
        print("[ERROR] No voter folders found.")
        return

    print(f"[INFO] All IDs on disk: {all_ids}")
    print(f"[INFO] Existing model classes: {previous_classes}")

    # 3. Compare classes
    same_class_set = sorted(previous_classes) == sorted(all_ids)

    if same_class_set and previous_classes:
        # Classes match → safe to use partial_fit
        new_ids = sorted(set(all_ids) - set(previous_classes))
        if not new_ids:
            print("[INFO] No new IDs found. Skipping training.")
            return
        print(f"[INFO] Using incremental training on new IDs: {new_ids}")
        X_new, y_new = get_embeddings_for_ids(new_ids)
        if len(X_new) == 0:
            print("[ERROR] No embeddings found. Aborting.")
            return
        clf.partial_fit(X_new, y_new, classes=np.array(all_ids))
        centroids = update_centroids(centroids, X_new, y_new)
    else:
        # Class set has changed → retrain from scratch
        print("[INFO] Class mismatch. Performing full retraining.")
        X_all, y_all = get_embeddings_for_ids(all_ids)
        if len(X_all) == 0:
            print("[ERROR] No embeddings found. Aborting.")
            return
        clf = SGDClassifier(loss='log_loss', max_iter=1000)
        clf.fit(X_all, y_all)
        centroids = update_centroids({}, X_all, y_all)

    # 4. Save model
    joblib.dump({'clf': clf, 'centroids': centroids, 'classes': all_ids}, MODEL_PATH)
    print(f"[INFO] Model saved with classes: {all_ids}")

if __name__ == "__main__":
    train_incrementally()
