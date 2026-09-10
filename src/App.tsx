import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Utama: Login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/login" element={<Login />} /> */}

        {/* Halaman Percakapan: Chat */}
        <Route path="/chat" element={<ChatPage />} />
        {/* <Route path="/chat" element={<Chat />} /> */}

        {/* Redirect otomatis ke halaman login jika rute tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
