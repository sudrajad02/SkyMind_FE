import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Utama: Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-v2" element={<LoginPage />} />

        {/* Halaman Percakapan: Chat */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat-v2" element={<ChatPage />} />

        {/* Redirect otomatis ke halaman login jika rute tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
