# VoteChain – Blockchain-Based Biometric E-Voting System

VoteChain is a decentralized electronic voting system that integrates blockchain technology with biometric authentication (Face Recognition and Fingerprint Verification) to ensure transparency, security, and voter integrity.

This repository contains the **final capstone project version** prepared for academic peer review.

---

## 🔗 Previous Development Repository

Earlier development history and contributions can be found here:

https://github.com/rifat87/VoteChain

---

# 🧩 System Architecture

VoteChain combines:

* **Smart Contracts (Ethereum / Foundry)**
* **React Frontend (TypeScript)**
* **Centralized Backend Server**
* **Face Recognition Module**
* **Fingerprint Authentication Module**
* **Blockchain-based Vote Storage**

Critical voting logic is stored on-chain, while heavy or non-critical data is managed via centralized storage.

---

# 👥 User Roles

### 1️⃣ Admin (Election Commission)

* Register candidates
* Register voters
* End election
* Monitor election status

### 2️⃣ Voter

* Register with National ID
* Authenticate using biometric verification
* Cast vote securely
* Confirm vote on blockchain

### 3️⃣ Observer / Public

* View candidate list
* View election status
* View final results

---

# 🛠 Technologies Used

* Solidity (Smart Contracts)
* Foundry (Forge, Cast, Anvil)
* React + TypeScript
* Ethers.js
* Python (Face Recognition & Fingerprint Modules)
* MetaMask Wallet
* Ethereum Local Node (Anvil)

---

# 📂 Project Structure

```
votechain-frontend-ts/       → React typescript frontend
votechain-central-server/    → Backend server
votechain-face-recognition/  → Face recognition module
<!-- votechain-fingerprint/       → Fingerprint authentication -->
src/                         → Smart contracts
test/                        → Contract tests
```

---

# ⚙️ Installation & Setup

## 1️⃣ Prerequisites

Make sure the following are installed:

* Node.js (v18+ recommended)
* npm
* Python 3.10+
* Foundry
* MetaMask browser extension

---

## 2️⃣ Install Dependencies

### Frontend

```bash
cd votechain-frontend-ts
npm install
```

### Backend

```bash
cd votechain-central-server
npm install
```

### Face Recognition (Python)

```bash
cd votechain-face-recognition
pip install -r requirements.txt
```

---

## 3️⃣ Smart Contract (Foundry)

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Start Local Blockchain

```bash
anvil
```

### Deploy Contract

```bash
forge script script/LocalDeployVoting.s.sol --rpc-url http://127.0.0.1:8545 --private-key <YOUR_PRIVATE_KEY> --broadcast
```

---

# 🚀 Running the Application

1. Start Anvil (local blockchain)
2. Deploy smart contract
3. Start backend server
4. Start frontend
5. Connect MetaMask to local network
6. Access application via browser

---

# 🔐 Security Design

* One-person-one-vote enforced by smart contract
* Biometric authentication before vote casting
* On-chain immutable vote storage
* Role-based redirection after wallet connection

---

# 🧪 Testing

Smart contract testing:

```bash
forge test
```

Frontend and backend modules were tested individually and through full integration testing.

---

# 📊 Peer Review Notes

* Large model files and development environments have been excluded from this repository.
* Dataset samples are included for biometric demonstration purposes.
* Full biometric dataset available upon request.

---

# 📄 License

This project is developed for academic purposes as part of a university capstone project.


## Here is a flowchart:
```
                    ┌─────────────────────────────────┐
                    │      User Visits Website        │
                    └─────────────┬───────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────┐
                    │   Public Dashboard (Landing)    │
                    │  - Election Status              │
                    │  - Candidate List               │
                    └─────────────┬───────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────┐
                    │  Prompt: Connect Wallet         │
                    └─────────────┬───────────────────┘
                                  │
                 ┌────────────────┴─────────────────┐
                 │ Wallet Connected?                │
                 └───────┬──────────────────────────┘
                         │ Yes
                         ▼
             ┌─────────────────────────────────┐
             │ Fetch Connected Wallet Address  │
             └─────────────┬───────────────────┘
                         │
                         ▼
             ┌─────────────────────────────────┐
             │  Get Admin Address from Contract │
             └─────────────┬───────────────────┘
                         │
                         ▼
         ┌──────────────┴─────────────┐
         │ Compare Wallet vs Admin    │
         │    (toLowerCase())         │
         └──────────────┬─────────────┘
                         │
          ┌──────────────┴─────────────┐
          │                            │
          ▼                            ▼
  ┌─────────────────┐        ┌────────────────────┐
  │  Admin Dashboard│        │  Voter Dashboard   │
  │  (Registration, │        │  (Registration,    │
  │   Election Mgt) │        │   Biometric Auth,  │
  │                 │        │   Vote Casting)    │
  └─────────────────┘        └────────────────────┘
                         │
                         ▼
          ┌─────────────────────────────────┐
          │    Observers & Public View      │
          │ (Election Results, Candidate    │
          │  Info, Voter Turnout, etc.)       │
          └─────────────────────────────────┘

```




# Data of App.tsx:

![App.tsx](images/apptsx.png)


# Data Flow from PublicDashboard

```javascript
[User visits /] 
     ↓
React renders PublicDashboard
     ↓
useEffect triggers fetchPublicElectionData()
     ↓
GET http://localhost:5000/api/elections/public/election-data
     ↓
Backend (Express.js)
   → Reads candidate data from MongoDB
   → Optionally fetches live vote counts from Blockchain
   → Returns JSON { candidates[], ended, count }
     ↓
Frontend updates state & renders

```

```javascript
Frontend (PublicDashboard.tsx)
  ↓
GET /api/elections/public/election-data
  ↓
Express Route: router.get('/public/election-data', electionController.getElectionData)
  ↓
electionController.getElectionData()
  ↓
Blockchain (via getContract()):
    - electionEnded()
    - candidateCount()
    - getCandidates()
  ↓
Contract returns data → processed in JS → sent as JSON
  ↓
Frontend state updates & renders
```

# The data flow for role-checking

```javascript
WalletProvider (frontend)
  ↓
Reads connected wallet address from MetaMask
  ↓
Calls blockchain contract function (e.g., getRole(address))
  ↓
Sets global state: role = 'admin' | 'voter'
  ↓
Dashboards use role to decide UI and routes

```


# Data flow at login

```javascript
[User clicks Connect Wallet]
       ↓
MetaMask pops up
       ↓
frontend/wallet-provider.tsx:
  - eth_requestAccounts → signer
  - createContract(signer)
  - electionCommission() → admin address
  - Compare with connected wallet
       ↓
If match → /admin
Else     → /voter

```



# Cadidate Registration Flow

```javascript
Admin (RegisterCandidate.tsx)
    │
    ├─ FaceCapture → POST /api/candidates/train-face/:nid → MongoDB (face embeddings)
    │
    ├─ GET /api/candidates/face-hash/:nid → Face hash (from MongoDB)
    │
    ├─ Blockchain: registerCandidate(name, NID, location, faceHash)
    │
    └─ POST /api/candidates/register → MongoDB (full profile + blockchainId)


  const tx = await registerCandidate(
  formData.name,         // Candidate full name
  formData.nationalId,   // NID (10-digit string)
  formData.location,     // Constituency or area
  faceHash               // SHA-256 hash of face images
)


```


```javascript
Admin (Frontend: RegisterCandidate.tsx)
    |
    |---[1] FaceCapture component--->
    |    POST /api/candidates/train-face/:nid
    |    -------------------------------------
    |    Backend:
    |       - Stores captured face images
    |       - Runs ML training
    |       - Saves embeddings in MongoDB
    |    -------------------------------------
    |<--- 200 OK (Face trained)
    |
    |---[2] GET /api/candidates/face-hash/:nid--->
    |    ----------------------------------------
    |    Backend:
    |       - Reads stored face images
    |       - Generates SHA-256 faceHash
    |    ----------------------------------------
    |<--- faceHash (string)
    |
    |---[3] registerCandidate(name, NID, location, faceHash) --->
    |    -------------------------------------------------------
    |    Blockchain (Smart Contract):
    |       - Stores candidate { id, name, NID, location, faceHash, voteCount=0, isVerified=false }
    |       - Emits CandidateRegistered event
    |    -------------------------------------------------------
    |<--- Transaction receipt (tx.hash)
    |
    |---[4] POST /api/candidates/register--->
    |    Body:
    |       - name, party, NID, fathersName, mothersName, DOB,
    |         bloodGroup, postOffice, postCode, location,
    |         faceId (regenerated in backend),
    |         fingerprint (SHA256 placeholder),
    |         blockchainId = tx.hash
    |    ------------------------------------
    |    Backend:
    |       - Saves full candidate profile in MongoDB
    |       - Adds timestamps, verification status
    |    ------------------------------------
    |<--- 201 Created (Candidate saved)
    |
[Frontend navigates back to /admin dashboard]

```


# End to End flow: Face Registration(Voter/ Candidate)

```javascript
sequenceDiagram
    autonumber
    participant FE as Frontend (FaceCapture.tsx)
    participant BR as Backend Routes (biometricRoutes.js)
    participant PY as Python Script (dataset.py)
    participant FS as File System (/dataset/<NID>)
    participant HF as Backend Face Hash API (/face-hash/:nid)
    participant TF as Train Face API (/train-face/:nid)
    participant PYTF as Python Script (train_faces.py)
    participant BC as Blockchain (Smart Contract)
    participant DB as MongoDB (Central DB)

    Note over FE: User clicks "Start Capture"

    FE->>BR: POST /api/biometric/capture-face {nid}
    BR->>PY: spawn("python dataset.py <nid>")
    PY->>PY: Open webcam, load InsightFace model
    PY->>PY: Loop until 10 images captured<br/>Check face bbox + diff_thresh
    PY->>FS: Save annotated face images<br/>(<nid>_1.jpg ... <nid>_10.jpg)
    PY->>BR: stdout logs ("Saved 1/10...", etc.)
    PY-->>BR: Exit code 0 (success)

    BR-->>FE: { success:true, output:"Saved 1/10..." }

    FE->>HF: GET /api/{voters|candidates}/face-hash/:nid
    HF->>FS: Read all images for <nid>
    HF->>HF: Compute SHA256 hash of concatenated image bytes
    HF-->>FE: { faceHash: "<64-char-hex>" }

    FE->>TF: POST /api/{voters|candidates}/train-face/:nid
    TF->>PYTF: spawn("python train_faces.py")
    PYTF->>FS: Load images for all IDs in dataset/
    PYTF->>PYTF: Extract embeddings with InsightFace
    PYTF->>PYTF: Update or retrain SGDClassifier
    PYTF->>FS: Save model (face_encodings.pkl)
    PYTF-->>TF: Training done
    TF-->>FE: { success:true }

    Note over FE: After biometric ready, Admin clicks "Register Voter/Candidate"

    FE->>BC: registerVoter(name, nid, location, faceHash)
    BC-->>FE: blockchainId

    FE->>DB: POST /api/{voters|candidates}/register
    DB->>DB: Store all personal info + faceId (hash) + blockchainId
    DB-->>FE: { success:true }

    Note over FE: Registration complete on both blockchain & DB

```
