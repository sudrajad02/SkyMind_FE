import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

// =========================================================================
// 1. IMPORT IKON DARI LUCIDE-REACT
// Ikon-ikon vektor yang digunakan di berbagai bagian antarmuka chat
// =========================================================================
import {
  Archive,        // Ikon arsip di menu bawah sidebar
  Bot,            // Ikon kepala robot untuk avatar asisten AI
  ChevronDown,    // Ikon panah bawah (dropdown profile & header)
  Copy,           // Ikon salin teks pesan
  FileText,       // Ikon dokumen pada saran prompt "Summarize"
  Image,          // Ikon gambar pada saran prompt "Create ideas"
  LogOut,         // Ikon keluar / logout untuk kembali ke login
  Menu,           // Ikon hamburger menu untuk membuka/menutup sidebar di mobile
  MessageSquare,  // Ikon gelembung chat pada daftar riwayat chat & saran prompt
  MoreHorizontal, // Ikon titik tiga (menu opsi tambahan)
  Paperclip,      // Ikon klip kertas untuk melampirkan berkas/dokumen
  Plus,           // Ikon tanda tambah pada tombol "New chat"
  Search,         // Ikon kaca pembesar pada fitur pencarian riwayat
  Send,           // Ikon pesawat kertas pada tombol kirim pesan
  Settings,       // Ikon roda gigi untuk menu pengaturan
  Sparkles,       // Ikon bintang berkilau pada logo & saran "Help me write"
  ThumbsDown,     // Ikon jempol ke bawah (dislike/feedback buruk balasan AI)
  ThumbsUp,       // Ikon jempol ke atas (like/feedback baik balasan AI)
} from "lucide-react";

// =========================================================================
// 2. IMPORT KOMPONEN UI DARI SHADCN
// Komponen UI yang sudah dirancang rapi, accessible, dan kompatibel dengan Tailwind
// =========================================================================
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

/* =====================================================
   3. TYPES & INTERFACES (TypeScript)
   Mendefinisikan bentuk tipe data untuk keamanan kode
===================================================== */

// Peran pengirim pesan: hanya bisa "user" (pengguna) atau "assistant" (bot AI)
type MessageRole = "user" | "assistant";

// Format sub-bagian list di dalam pesan balasan AI
interface MessageSection {
  title: string;    // Contoh: "1. Planning"
  items: string[];  // Contoh: ["Define goals", "Research competitors"]
}

// Model data lengkap untuk satu buah pesan obrolan
interface Message {
  id: number;                 // ID unik pesan (biasanya timestamp angka)
  role: MessageRole;          // Siapa pengirimnya ("user" atau "assistant")
  content: string;            // Teks isi pesan utama
  list?: MessageSection[];    // (Opsional) Jika balasan AI memiliki daftar poin terstruktur
  footer?: string;            // (Opsional) Kalimat penutup balasan AI
}

// Model data untuk kartu saran ide prompt di halaman kosong
interface Suggestion {
  icon: typeof MessageSquare; // Komponen ikon Lucide yang dipakai
  title: string;              // Judul saran prompt
  text: string;               // Isi teks yang akan dimasukkan ke input saat diklik
}

// Tipe data riwayat chat: Key berupa kategori string (misal "Today"),
// valuenya berupa array judul chat (string[])
type ChatHistory = Record<string, string[]>;

/* =====================================================
   4. DATA AWAL (MOCK DATA)
   Data tiruan untuk simulasi tampilan UI sebelum terhubung ke backend
===================================================== */

// Pesan awal yang langsung muncul sebagai contoh interaksi percakapan
const initialMessages: Message[] = [
  {
    id: 1,
    role: "user",
    content: "Can you help me create a simple project plan for a website?",
  },
  {
    id: 2,
    role: "assistant",
    content: "Of course! Here's a simple project plan for a new website:",
    list: [
      {
        title: "1. Planning",
        items: [
          "Define goals and requirements",
          "Research competitors",
          "Create project roadmap",
        ],
      },
      {
        title: "2. Design",
        items: [
          "Create wireframes",
          "Design the UI",
          "Review and collect feedback",
        ],
      },
      {
        title: "3. Development",
        items: [
          "Frontend development",
          "Backend integration",
          "Testing and optimization",
        ],
      },
      {
        title: "4. Launch",
        items: ["Final testing", "Deploy to production", "Monitor performance"],
      },
    ],
    footer: "Would you like me to break this down into a detailed timeline?",
  },
];

// Data riwayat percakapan di sidebar yang dikelompokkan berdasarkan waktu
const chatHistory: ChatHistory = {
  Today: [
    "Project planning help",
    "React component example",
    "Marketing strategy",
    "UI design feedback",
  ],

  Yesterday: [
    "Explain quantum computing",
    "Write a cover letter",
    "Database schema design",
  ],

  "Previous 7 days": [
    "Summarize this document",
    "Travel itinerary",
    "Python script error",
  ],
};

// 4 Pilihan ide pertanyaan cepat yang tampil saat belum ada pesan di ruang chat
const suggestions: Suggestion[] = [
  {
    icon: MessageSquare,
    title: "Explain something",
    text: "Explain a complex topic simply",
  },
  {
    icon: FileText,
    title: "Summarize",
    text: "Summarize a document or article",
  },
  {
    icon: Image,
    title: "Create ideas",
    text: "Help me brainstorm new ideas",
  },
  {
    icon: Sparkles,
    title: "Help me write",
    text: "Write or improve something",
  },
];

/* =====================================================
   5. KOMPONEN UTAMA (CHAT PAGE)
===================================================== */

export default function Chat() {
  // Hook untuk navigasi halaman (misal: kembali ke login saat logout)
  const navigate = useNavigate();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  // State array yang menampung seluruh daftar pesan percakapan aktif
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // State string untuk menampung teks yang sedang diketik user di textarea
  const [input, setInput] = useState<string>("");

  // State boolean untuk mengatur apakah sidebar terbuka atau tertutup (berguna di HP)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // State boolean penanda apakah AI sedang mengetik respons (menampilkan animasi loading)
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  /**
   * Menangani aksi pengiriman pesan:
   * Bisa dipicu dari onSubmit formulir atau event onKeyDown (tombol Enter di textarea)
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Mencegah browser melakukan refresh halaman
    event.preventDefault();

    const message = input.trim();

    // Jika pesan kosong atau AI sedang mengetik, jangan lakukan apa-apa
    if (!message || isTyping) {
      return;
    }

    // 1. Buat objek pesan dari user
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    // 2. Tambahkan pesan user ke daftar pesan dan bersihkan kolom input
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true); // Aktifkan animasi indikator mengetik

    /*
     * CATATAN INTEGRASI BACKEND:
     * Di sini tempat kamu menghubungkan API AI (seperti Gemini, OpenAI, atau backend custom kamu).
     * Contoh:
     *
     * const response = await fetch("/api/chat", {
     *   method: "POST",
     *   headers: { "Content-Type": "application/json" },
     *   body: JSON.stringify({ message }),
     * });
     * const data = await response.json();
     */

    // Simulasi jeda respon server selama 1 detik
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));

    // 3. Buat balasan tiruan dari asisten AI
    const assistantMessage: Message = {
      id: Date.now(),
      role: "assistant",
      content:
        "I'd be happy to help with that. This is where the AI response will appear once your backend API is connected.",
    };

    // 4. Masukkan balasan AI ke daftar pesan dan matikan animasi mengetik
    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  /**
   * Mengisi otomatis kolom input textarea ketika user mengklik salah satu kartu rekomendasi prompt
   */
  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  /**
   * Mereset percakapan saat tombol "New chat" diklik
   */
  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    // Container utama seluruh layar: flex layout horizontal, tinggi 100vh tanpa scroll di level body
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* =========================================================================
          MOBILE OVERLAY (BACKDROP)
          Latar gelap semi-transparan yang muncul di layar HP saat sidebar sedang terbuka.
          Jika user mengklik area gelap ini, sidebar otomatis tertutup.
      ========================================================================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================================================
          SIDEBAR KIRI
          - Di desktop (lg:): posisi relatif, lebar tetap 280px.
          - Di mobile: posisi fixed (melayang di atas konten) dengan animasi geser (translate-x).
      ========================================================================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex w-[280px] flex-col
          border-r bg-muted/30
          transition-transform duration-200

          lg:relative lg:translate-x-0

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header Sidebar: Logo & Tombol Close di Layar Mobile */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">ChatBotApp</span>
          </div>

          {/* Tombol tutup sidebar (hanya terlihat di HP) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Tombol "New Chat" untuk membuat sesi baru */}
        <div className="px-3">
          <Button
            variant="outline"
            className="h-10 w-full justify-start gap-2 bg-background"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>

        {/* Tombol Pencarian Riwayat Chat */}
        <div className="px-3 pt-2">
          <Button
            variant="ghost"
            className="h-10 w-full justify-start gap-3 text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            Search
            <span className="ml-auto text-xs text-muted-foreground">⌘ K</span>
          </Button>
        </div>

        {/* Garis pemisah tipis */}
        <Separator className="my-3" />

        {/* Daftar Riwayat Chat (Bisa di-scroll secara independen) */}
        <div className="flex-1 overflow-y-auto px-3">
          {Object.entries(chatHistory).map(([group, chats]) => (
            <div key={group} className="mb-5">
              {/* Judul Kelompok Riwayat (misal: TODAY, YESTERDAY) */}
              <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group}
              </p>

              {/* Daftar item chat dalam grup */}
              <div className="space-y-0.5">
                {chats.map((chat, index) => (
                  <button
                    key={chat}
                    type="button"
                    className={`
                        group flex w-full items-center
                        gap-2 rounded-lg px-2 py-2.5
                        text-left text-sm
                        transition-colors

                        ${
                          // Beri highlight latar belakang jika merupakan chat aktif saat ini
                          group === "Today" && index === 0
                            ? "bg-muted font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        }
                      `}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{chat}</span>

                    {/* Ikon titik tiga muncul saat tombol di-hover */}
                    <MoreHorizontal
                      className="
                          ml-auto hidden h-4 w-4
                          shrink-0
                          text-muted-foreground
                          group-hover:block
                        "
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bagian Bawah Sidebar: Menu Pengaturan, Arsip & Profil Akun */}
        <div className="border-t p-3">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Settings
          </Button>

          <Button variant="ghost" className="mt-1 w-full justify-start gap-3">
            <Archive className="h-4 w-4" />
            Archive
          </Button>

          {/* Tombol Logout untuk kembali ke halaman Login */}
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-600"
            onClick={() => navigate("/")}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>

          {/* Kartu Profil Singkat Pengguna */}
          <div className="mt-3 flex items-center gap-3 rounded-lg p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Alex Carter</p>
              <p className="truncate text-xs text-muted-foreground">
                alex@example.com
              </p>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          AREA UTAMA (HEADER, RUANG PERCAKAPAN, INPUT CHAT)
      ========================================================================= */}
      <main className="flex min-w-0 flex-1 flex-col">
        
        {/* Header Atas Chat */}
        <header className="flex h-16 shrink-0 items-center border-b px-4">
          {/* Tombol hamburger menu di mobile untuk membuka sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Nama Bot / Model yang sedang aktif */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
          >
            <span className="font-semibold">ChatBotApp</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Aksi di sisi kanan header: Tombol Upgrade & Avatar */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 sm:flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade
            </Button>

            <Avatar className="h-8 w-8">
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* =========================================================================
            RUANG PESAN CHAT (Bisa di-scroll vertikal)
        ========================================================================= */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Tampilkan tampilan EmptyChat jika pesan masih kosong,
                atau render daftar pesan jika sudah ada obrolan */}
            {messages.length === 0 ? (
              <EmptyChat onSuggestion={handleSuggestion} />
            ) : (
              <div className="space-y-8">
                {/* Loop seluruh pesan dan tampilkan dengan komponen <Message /> */}
                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}

                {/* Indikator titik-titik animasi saat AI sedang merespons */}
                {isTyping && <TypingIndicator />}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            KOTAK INPUT FORM (DI BAGIAN BAWAH)
        ========================================================================= */}
        <div className="px-4 pb-4">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={handleSubmit}
              className="
                relative rounded-2xl
                border bg-background
                shadow-sm
                transition-shadow
                focus-within:shadow-md
              "
            >
              {/* Kolom Teks (Textarea):
                  - Shift + Enter: Membuat baris baru
                  - Enter biasa: Mengirimkan pesan
              */}
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault(); // Mencegah baris baru
                    void handleSubmit(event); // Kirim pesan
                  }
                }}
                placeholder="Ask anything..."
                rows={1}
                className="
                  min-h-[56px] w-full
                  resize-none
                  bg-transparent
                  px-14 py-4 pr-14
                  text-sm
                  outline-none
                  placeholder:text-muted-foreground
                "
              />

              {/* Tombol Lampiran Dokumen (Attachment) */}
              <button
                type="button"
                aria-label="Attach file"
                className="
                  absolute bottom-3 left-3
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg
                  text-muted-foreground
                  hover:bg-muted
                "
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Tombol Kirim Pesan */}
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || isTyping}
                className="
                  absolute bottom-3 right-3
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg
                  bg-zinc-950
                  text-white
                  transition-opacity
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Teks Disclaimer Keamanan AI di Bawah Form */}
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              ChatBotApp can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =====================================================
   6. KOMPONEN PESAN (<Message />)
   Menampilkan balon pesan untuk User atau Asisten AI
===================================================== */

interface MessageProps {
  message: Message;
}

function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  // JIKA PENGIRIM ADALAH USER:
  // Tampilkan balon chat di sisi kanan dengan latar abu-abu halus (bg-muted)
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3 text-sm leading-6">
          {message.content}
        </div>
      </div>
    );
  }

  // JIKA PENGIRIM ADALAH ASISTEN AI:
  // Tampilkan di sisi kiri, dilengkapi dengan avatar robot dan tombol aksi (copy/like)
  return (
    <div className="flex gap-4">
      {/* Avatar Robot */}
      <AssistantAvatar />

      <div className="min-w-0 flex-1">
        <div className="text-sm leading-7">
          <p>{message.content}</p>

          {/* Render daftar list poin jika balasan AI menyertakannya */}
          {message.list && (
            <div className="mt-4 space-y-4">
              {message.list.map((section) => (
                <div key={section.title}>
                  <p className="font-semibold">{section.title}</p>

                  <ul className="ml-5 mt-1 list-disc space-y-1 text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Kalimat penutup balasan AI */}
          {message.footer && <p className="mt-5">{message.footer}</p>}
        </div>

        {/* Tombol Aksi di Bawah Balasan AI: Copy, Like, Dislike, dan More */}
        <div className="mt-3 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Copy message"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Like message"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Dislike message"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   7. KOMPONEN AVATAR ASISTEN (<AssistantAvatar />)
   Lingkaran hitam kecil berisi ikon kepala robot
===================================================== */
function AssistantAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
      <Bot className="h-4 w-4" />
    </div>
  );
}

/* =====================================================
   8. INDIKATOR MENGETIK (<TypingIndicator />)
   Menampilkan animasi 3 titik melompat (bounce) dengan jeda delay waktu
===================================================== */
function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <AssistantAvatar />

      <div className="flex items-center gap-1 pt-2">
        {/* Titik 1: Bounce normal */}
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
        {/* Titik 2: Bounce dengan jeda 100ms */}
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:100ms]" />
        {/* Titik 3: Bounce dengan jeda 200ms */}
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:200ms]" />
      </div>
    </div>
  );
}

/* =====================================================
   9. TAMPILAN KOSONG (<EmptyChat />)
   Muncul ketika belum ada obrolan apa pun di dalam sesi chat.
   Berisi logo pembuka, pertanyaan pemantik, dan 4 kartu rekomendasi prompt.
===================================================== */

interface EmptyChatProps {
  onSuggestion: (text: string) => void;
}

function EmptyChat({ onSuggestion }: EmptyChatProps) {
  return (
    <div className="flex min-h-[calc(100vh-180px)] flex-col items-center justify-center">
      {/* Logo Bintang di Tengah */}
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
        <Sparkles className="h-7 w-7" />
      </div>

      <h1 className="text-center text-3xl font-semibold tracking-tight">
        What can I help you with?
      </h1>

      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        Ask a question, explore an idea, or start a conversation.
      </p>

      {/* Grid 4 Kartu Rekomendasi Prompt */}
      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;

          return (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => onSuggestion(suggestion.text)}
              className="
                  group rounded-xl
                  border p-4
                  text-left
                  transition-colors
                  hover:bg-muted/50
                "
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">{suggestion.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {suggestion.text}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
