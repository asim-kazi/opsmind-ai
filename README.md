# ✦ OpsMind AI - Enterprise SOP Assistant 🚀

OpsMind AI is an intelligent, full-stack Enterprise Assistant powered by **RAG (Retrieval-Augmented Generation)** and **Google's Gemini AI**. It allows users to upload complex PDF documents (like SOPs, policy guidelines, and project manuals) and ask natural language questions to get highly accurate, context-aware answers complete with exact page references.

---

## ✨ Key Features

- 📄 **Intelligent Document Ingestion:** Upload PDF files, extract text, and automatically chunk data for vectorization.
- 🧠 **Advanced RAG Engine:** Utilizes Google's `embedding-001` model and MongoDB Atlas Vector Search to retrieve the most relevant document chunks.
- ⚡ **Streaming AI Responses (SSE):** ChatGPT-style letter-by-letter typing effect using Server-Sent Events for a premium user experience.
- 🎯 **Contextual Accuracy:** AI explicitly cites the source filename, section, and page numbers for every answer.
- 🔐 **Secure Authentication:** JWT-based Login and Signup system. Users can only chat if authenticated.
- 📜 **Persistent Chat History:** Create, rename, and delete multiple chat sessions. History is safely managed per user.
- 🐳 **Dockerized:** Fully containerized backend and frontend for seamless deployment across any environment.

---

## 🛠️ Tech Stack

**Frontend:**

- React.js (Vite)
- Tailwind CSS v4
- Axios
- Server-Sent Events (SSE) API

**Backend:**

- Node.js & Express.js
- MongoDB Atlas (Database & Vector Search Index)
- Google Generative AI SDK (`gemini-1.5-flash` & `embedding-001`)
- JWT (JSON Web Tokens) & bcryptjs (Security)
- Multer & pdf-parse (File Handling)

**DevOps:**

- Docker & Docker Compose

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional, for containerized run)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Account (with a Vector Search Index configured)
- A [Google Gemini API Key](https://aistudio.google.com/)

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory and add the following keys:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/opsmind?retryWrites=true
GEMINI_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
```

## 🚀 Installation & Setup (Local)

### 1. Clone the repository:

```bash
git clone [https://github.com/yourusername/opsmind-ai.git](https://github.com/yourusername/opsmind-ai.git)
cd opsmind-ai
```

### 2. Setup Backend:

```bash
cd backend
npm install
npm run dev
```

### 3. Setup Frontend:

```bash
cd frontend
npm install
npm run dev
```

The application will be running at http://localhost:5173/

## 🐳 Running with Docker

Don't want to install dependencies locally? Run the entire stack using Docker!

Make sure your backend/.env file is ready, then run from the root directory:

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173

- Backend: http://localhost:5000

## 📂 Project Structure

```Plaintext
opsmind-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Logic for Upload, Chat, and Auth
│   │   ├── models/        # MongoDB Schemas (User, DocumentChunk)
│   │   ├── services/      # AI Embedding and Streaming Logic
│   │   └── server.js      # Main Express App
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Header, Sidebar, ChatArea, AuthModal
│   │   ├── App.jsx        # Global State Management
│   │   └── index.css      # Tailwind Directives & Custom Scrollbar
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml     # Orchestrates Frontend and Backend
```

Built with ❤️ for solving complex enterprise workflows.
