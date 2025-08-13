import os
import cv2
import numpy as np
import joblib
from sklearn.linear_model import SGDClassifier
from collections import defaultdict
from insightface.app import FaceAnalysis

# CONFIGURATION
DATA_DIR   = "dataset"             # Root folder with subfolders per voter_id
MODEL_PATH = "classifier2.pkl"   # Path to save/load model+centroids

# Initialize InsightFace (CPU-only)
model = FaceAnalysis(name='buffalo_l')
model.prepare(ctx_id=-1)


def get_embeddings_for_ids(voter_ids, data_dir=DATA_DIR):
    """
    Extract embeddings for specified voter_ids from disk.
    Returns:
      X: np.ndarray of embeddings
      y: np.ndarray of labels
    """
    X, y = [], []
    for vid in voter_ids:
        folder = os.path.join(data_dir, vid)
        if not os.path.isdir(folder):
            print(f"[DEBUG] Missing folder for voter ID '{vid}': {folder}")
            continue
        for fname in os.listdir(folder):
            # Only consider common image types
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                print(f"[DEBUG] Skipping non-image file: {fname}")
                continue
            path = os.path.join(folder, fname)
            img = cv2.imread(path)
            if img is None:
                print(f"[DEBUG] Failed to load image: {path}")
                continue
            faces = model.get(img)
            print(f"[DEBUG] {len(faces)} faces detected in {path}")
            if not faces:
                continue
            X.append(faces[0].embedding)
            y.append(vid)
    print(f"[DEBUG] Embeddings collected: X.shape={np.array(X).shape}, y.shape={np.array(y).shape}")
    return np.array(X), np.array(y)


def update_centroids(existing_centroids, X, y):
    """
    Given existing centroids and new embeddings X,y, compute updated centroids.
    """
    buckets = defaultdict(list)
    # include previous centroid embeddings in buckets
    for lbl, cent in existing_centroids.items():
        buckets[lbl].append(cent)
    # add new embeddings
    for emb, lbl in zip(X, y):
        buckets[lbl].append(emb)
    # compute mean per label
    new_centroids = {lbl: np.mean(embs, axis=0) for lbl, embs in buckets.items()}
    return new_centroids


def train_incrementally():
    # 1) Load or initialize model
    if os.path.exists(MODEL_PATH):
        raw = joblib.load(MODEL_PATH)
        if isinstance(raw, dict) and 'clf' in raw and 'centroids' in raw:
            clf = raw['clf']
            centroids = raw['centroids']
            existing_ids = set(centroids.keys())
            print(f"[INFO] Loaded existing model with classes: {sorted(existing_ids)}")
        else:
            clf = raw
            centroids = {}
            existing_ids = set(getattr(clf, 'classes_', []))
            print(f"[INFO] Loaded legacy classifier with classes: {sorted(existing_ids)}")
    else:
        clf = SGDClassifier(loss='log_loss', max_iter=1000)
        centroids = {}
        existing_ids = set()
        print("[INFO] No existing model found. Starting fresh.")

    # 2) Identify voter IDs on disk
    all_ids = {d for d in os.listdir(DATA_DIR)
               if os.path.isdir(os.path.join(DATA_DIR, d))}
    new_ids = sorted(all_ids - existing_ids)
    print(f"[INFO] All IDs on disk: {sorted(all_ids)}")
    print(f"[INFO] Existing IDs in model: {sorted(existing_ids)}")
    print(f"[INFO] New IDs to train: {new_ids}")

    # 3) If no new IDs, full retrain
    if not new_ids:
        print("[INFO] No new voters. Performing full retrain on all IDs.")
        X_all, y_all = get_embeddings_for_ids(sorted(all_ids))
        if len(X_all) == 0:
            print("[ERROR] No embeddings found for any IDs. Aborting.")
            return
        clf = SGDClassifier(loss='log_loss', max_iter=1000)
        clf.fit(X_all, y_all)
        centroids = update_centroids({}, X_all, y_all)
        joblib.dump({'clf': clf, 'centroids': centroids}, MODEL_PATH)
        print(f"[INFO] Full retrain complete on {len(all_ids)} classes. Model saved.")
        return

    # 4) Extract and train on new IDs only
    X_new, y_new = get_embeddings_for_ids(new_ids)
    if len(X_new) == 0:
        print("[ERROR] Could not extract embeddings for new IDs. Aborting incremental training.")
        return
    all_classes = np.array(sorted(existing_ids | set(new_ids)))
    clf.partial_fit(X_new, y_new, classes=all_classes)
    print(f"[INFO] incremental partial_fit on new IDs: {new_ids}")

    # 5) Update centroids
    centroids = update_centroids(centroids, X_new, y_new)
    print(f"[INFO] Centroids updated for IDs: {new_ids}")

    # 6) Save updated model
    joblib.dump({'clf': clf, 'centroids': centroids}, MODEL_PATH)
    print(f"[INFO] Incremental model saved to {MODEL_PATH}.")

if __name__ == '__main__':
    train_incrementally()
