import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { ProtectedRouter, PublicRoute } from "./components/auth/ProtectedRoute";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman public */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Halaman protected */}
        <Route
          path="/chat"
          element={
            <ProtectedRouter>
              <ChatPage />
            </ProtectedRouter>
          }
        />
        {/* <Route path="/chat" element={<Chat />} /> */}

        {/* Redirect otomatis ke halaman login jika rute tidak ditemukan */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
