import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Archive,
  Check,
  CircleUserRound,
  Copy,
  Ellipsis,
  Folders,
  Images,
  Library,
  LogOut,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Share,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ChatPage() {
  const navigate = useNavigate();
  // 1. Simpan pesan
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [activeNav, setActiveNav] = useState<string>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fungsi ambil chat history dari be
  const fetchChatHistory = async () => {
    const token = localStorage.getItem("access_token");

    const apiUrl = import.meta.env.VITE_BE_URL;

    // validasi token jika belum login
    if (!token) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    setLoadingHistory(true);

    try {
      // request chat history ke be
      const response = await axios.get(`${apiUrl}/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Riwayat sesi dari be: ", response.data);

      const sessionData = response.data?.data || response.data || [];
      setSessions(sessionData);
    } catch (error: any) {
      console.log("Gagal mengambil riwayat chat: ", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  // panggil fetch history
  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 2. mengirim pesan & menerima balasan
  const handleSendMessage = async (userText: string) => {
    // a. Buat pesan user
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userText,
    };

    // b. Tambahkan pesan user ke daftar pesan dan aktifkan loading
    const updateMessages = [...messages, userMessage];
    setMessages(updateMessages);
    setIsTyping(true);
    setIsThinking(true);

    let currentSessionId = activeChatId;
    if (!currentSessionId) {
      currentSessionId = Date.now().toString();
      setActiveChatId(currentSessionId);

      const newSession: ChatSession = {
        id: currentSessionId,
        title: userText,
        messages: updateMessages,
        createdAt: new Date(),
      };

      setSessions((prev) => [...prev, newSession]);
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages: updateMessages } : s,
        ),
      );
    }

    try {
      // Simulasi jeda respon
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const fullText = `Tentu! Berikut contoh kode JavaScript sederhana:
\`\`\`javascript
function hitungLuas(panjang, lebar) {
  return panjang * lebar;
}
console.log("Luas:", hitungLuas(5, 10));
\`\`\`
Fitur yang didukung:
- **Teks tebal** dan *miring*
- Kode inline seperti \`const x = 10\`
- Tombol **Copy Code** di pojok kanan atas kode program!`;

      const botId = Date.now() + 1;
      const botMessage: Message = {
        id: botId,
        role: "assistant",
        content: "",
      };

      // e. simpan balasan ai
      const withBotMessages = [...updateMessages, botMessage];
      setMessages(withBotMessages);
      setIsThinking(false);

      const words = fullText.split(" ");
      let accumulatedText = "";

      for (let i = 0; i < words.length; i++) {
        accumulatedText += (i === 0 ? "" : " ") + words[i];
        const currentText = accumulatedText;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, content: currentText } : m,
          ),
        );

        await new Promise((resolve) => setTimeout(resolve, 60));
      }

      const finalBotMessages: Message = {
        id: botId,
        role: "assistant",
        content: accumulatedText,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...updateMessages, finalBotMessages] }
            : s,
        ),
      );
    } catch (error) {
      // Handle error jika API gagal
      console.error("Error fetching response:", error);
    } finally {
      // f. Matikan status loading
      setIsTyping(false);
      setIsThinking(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setIsTyping(false);
    setIsThinking(false);
    setInputPrompt("");
    inputRef.current?.focus();
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      setMessages((prev) => prev.slice(0, -1));
      handleSendMessage(lastUserMessage.content);
    }
  };

  const handleSelectChat = (id: string) => {
    const selected = sessions.find((s) => s.id === id);
    if (selected) {
      setActiveChatId(selected.id);
      setMessages(selected.messages);
      setIsTyping(false);
      setIsThinking(false);
      setInputPrompt("");
      inputRef.current?.focus();
    }
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  const confirmDeleteChat = async () => {
    if (!sessionToDelete) return;

    const token = localStorage.getItem("access_token");
    const apiUrl = import.meta.env.VITE_BE_URL;

    if (!token) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(`${apiUrl}/session/${sessionToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Session ${sessionToDelete} berhasil di hapus`);

      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));

      setSessionToDelete(null);
    } catch (error: any) {
      console.log("Gagal menghapus session: ", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }

      alert("Gagal menghapus sesi. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <ChatSideBar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onNewChat={handleNewChat}
        sessions={sessions}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        loadingHistory={loadingHistory}
      />

      {/* Main Chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-end px-5">
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-slate-600 sm:flex hover:bg-slate-100">
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade
            </div>

            <div className="hidden rounded-full items-center gap-2 px-2 py-2 text-sm font-medium text-slate-600 sm:flex hover:bg-slate-100">
              <Share className="h-4 w-4" />
              Share
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="hidden rounded-full px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex">
                <Ellipsis />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="bottom" align="end" className="w-45">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-sm mb-1 cursor-pointer gap-3">
                    <Library className="h-4 w-4"></Library>
                    <span>View files in chat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm mb-1 cursor-pointer gap-3">
                    <Pin className="h-4 w-4"></Pin>
                    <span>Pin chat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm mb-1 cursor-pointer gap-3">
                    <Archive className="h-4 w-4"></Archive>
                    <span>Archive</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm mb-1 cursor-pointer gap-3 text-red-400">
                    <Trash className="h-4 w-4"></Trash>
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5">
          <div
            className={`mx-auto flex w-full max-w-4xl flex-1 flex-col ${messages.length === 0 ? "justify-center" : "justify-between"}  px-5 py-2`}
          >
            {/* Welcome */}
            {messages.length === 0 ? (
              <div className="-mt-30 mb-8 text-center">
                <h1 className="text 2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  How can I help you today?
                </h1>
                {/* Suggestions */}
                <SuggestionList
                  onSelect={(t) => {
                    setInputPrompt(t);
                    inputRef.current?.focus();
                    inputRef.current?.setSelectionRange(t.length, t.length);
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                {messages.map((msg) => {
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === `user` ? "items-end" : "items-start"}`}
                    >
                      {/* Balon Chat */}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${msg.role === "user" ? "bg-blue-200 text-slate-600" : "bg-slate-100 text-slate-600"}`}
                      >
                        {msg.role === "assistant" ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === "assistant" && !isTyping && (
                        <MessageActions
                          content={msg.content}
                          onRegenerate={handleRegenerate}
                        />
                      )}
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500 animate-pulse">
                      Sedang berpikir...
                    </div>
                  </div>
                )}

                {/* Spacer agar scroll berfungsi */}
                <div ref={scrollRef} className="h-0 w-0" />
              </div>
            )}

            {/* Input */}
            <div className="sticky bottom-0 bg-white/70 backdrop-blur-md">
              <ChatInput
                inputRef={inputRef}
                prompt={inputPrompt}
                setPrompt={setInputPrompt}
                onSend={handleSendMessage}
                isTyping={isTyping}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Alert Konfirmasi Hapus */}
      <AlertDialog
        open={Boolean(sessionToDelete)}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent className="!max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold">Hapus percakapan?</AlertDialogTitle>
            <AlertDialogDescription>
              Percakapan ini beserta seluruh pesan di dalamnya akan dihapus
              secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-white border-none">
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteChat();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MessageActions({
  content,
  onRegenerate,
}: {
  content: string;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-1 flex items-center gap-1 text-slate-400">
      <button
        onClick={handleCopy}
        title="Salin Jawaban"
        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      <button
        onClick={() => setLiked(liked === true ? null : true)}
        title="Bagus"
        className={`flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-600 transition-colors ${liked === true ? "text-blue-600" : "hover:text-slate-600"}`}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => setLiked(liked === false ? null : false)}
        title="Kurang Bagus"
        className={`flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-600 transition-colors ${liked === false ? "text-red-500" : "hover:text-slate-600"}`}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={onRegenerate}
        title="Jawab Ulang"
        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface ChatSideBarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  loadingHistory: boolean;
}

function ChatSideBar({
  activeNav,
  setActiveNav,
  onNewChat,
  sessions,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  loadingHistory,
}: ChatSideBarProps) {
  const navigate = useNavigate();
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200 bg-muted/30 md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <span className="text-xl font-semibold">SkyMind</span>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 px-3">
        <button
          onClick={() => {
            setActiveNav("chat");
            onNewChat();
          }}
          className={`flex h-8 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors ${activeNav === "chat" && activeChatId === null ? "bg-slate-200 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-700/10"}`}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <button
          onClick={() => {
            setActiveNav("search");
          }}
          className={`flex h-8 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors ${activeNav === "search" ? "bg-slate-200 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-700/10"}`}
        >
          <Search className="h-4 w-4" />
          Search chats
        </button>

        <button
          onClick={() => setActiveNav("images")}
          className={`flex h-8 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors ${activeNav === "images" ? "bg-slate-200 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-700/10"}`}
        >
          <Images className="h-4 w-4" />
          Images
        </button>

        <button
          onClick={() => setActiveNav("library")}
          className={`flex h-8 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors ${activeNav === "library" ? "bg-slate-200 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-700/10"}`}
        >
          <Library className="h-4 w-4" />
          Library
        </button>

        <button
          onClick={() => setActiveNav("projects")}
          className={`flex h-8 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors ${activeNav === "projects" ? "bg-slate-200 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-700/10"}`}
        >
          <Folders className="h-4 w-4" />
          Projects
        </button>
      </div>

      {/* Chat History */}
      <div className="mt-4 flex-1 overflow-y-auto overflow-x-hidden px-3">
        <HistorySection
          title="Recents"
          sessions={sessions}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          loadingHistory={loadingHistory}
          // chats={[
          //   "Project planning ideas",
          //   "Summarize this article",
          //   "Marketing strategy",
          //   "UI design feedback",
          //   "Explain machine learning",
          //   "Travel itinerary",
          //   "Write email template",
          //   "Healthy meal ideas",
          //   "AI ethics discussion",
          //   "Best budget smartphones 2024",
          //   "How to start a podcast",
          //   "Tips for remote work productivity",
          //   "Understanding blockchain",
          //   "Creating a workout plan",
          //   "Interview preparation",
          //   "History of the internet",
          //   "Learning guitar basics",
          // ]}
        />
      </div>

      {/* User */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex w-full items-center justify-between rounded-lg p-1.5 hover:bg-slate-700/10">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left focus:outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                AC
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">Alex Carter</p>
                <p className="truncate text-xs text-slate-400">Free Plan</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-56"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="mt-1 text-sm font-medium leading-none">
                      Alex Carter
                    </p>
                    <p className="mt-1 text-xs leading-none text-slate-500">
                      alex@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem className="mt-2 cursor-pointer gap-3">
                  <CircleUserRound className="h-4 w-4"></CircleUserRound>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="mt-2 cursor-pointer gap-3">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/login-v2")}
                  className="mt-2 mb-2 cursor-pointer gap-3 text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className="rounded-full border-slate-700/20 bg-white px-2 py-1 text-xs text-slate-700"
          >
            Upgrade
          </Button>
        </div>
      </div>
    </aside>
  );
}

type HistorySectionProps = {
  title: string;
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  loadingHistory?: boolean;
};

function HistorySection({
  title,
  sessions,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  loadingHistory,
}: HistorySectionProps) {
  if (loadingHistory) {
    return (
      <div className="space-y-2 px-1">
        <p className="mb-2 px-2 text-xs font-medium tracking-wide text-slate-400">
          {title}
        </p>
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-full-animate-pulse rounded-lg bg-slate-200/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <p className="mb-2 px-2 text-sm font-medium tracking-wide text-slate-400">
        {title}
      </p>

      <TooltipProvider delay={200}>
        <div className="space-y-1">
          {sessions.map((s) => {
            const isActive = activeChatId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => onSelectChat(s.id)}
                className={`group flex h-8 w-full cursor-pointer items-center justify-between rounded-lg px-2 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-slate-200/80 font-medium text-slate-900"
                    : "text-slate-700 hover:bg-slate-700/10"
                }`}
              >
                <Tooltip disabled={s.title.length <= 25}>
                  <TooltipTrigger className="flex min-w-0 flex-1 items-center text-left focus:outline-none">
                    <span className="truncate">{s.title}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{s.title}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Tombol Hapus: muncul saat mouse di-hover */}
                <button
                  onClick={(e) => onDeleteChat(s.id, e)}
                  title="Hapus percakapan"
                  className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}

type ChatInputProps = {
  prompt: string;
  setPrompt: (text: string) => void;
  onSend: (text: string) => void;
  isTyping: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
};

function ChatInput({
  prompt,
  setPrompt,
  onSend,
  isTyping,
  inputRef,
}: ChatInputProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = inputRef || localRef;
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isTyping) {
      return;
    }

    onSend(prompt.trim());
    setPrompt("");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm background-blur-md">
      {/* Form */}
      <form className="relative" onSubmit={handleSubmit}>
        {/* Textarea */}
        <textarea
          ref={textAreaRef}
          rows={1}
          placeholder="Ask anything..."
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              handleSubmit(event);
            }
          }}
          className="max-h-48 min-h-[28px] w-full resize-none border-0 bg-transparent px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              title="Upload"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isTyping}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}

type SuggestionListProps = {
  onSelect: (text: string) => void;
};

function SuggestionList({ onSelect }: SuggestionListProps) {
  const suggestions = [
    "Summarize a document",
    "Help me write",
    "Explain a concept",
    "Brainstorm ideas",
    "Create an image",
    "Analyze data",
    "More",
  ];

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

type MessageRole = "user" | "assistant";

interface MessageSection {
  title: string; // Contoh: "1. Planning"
  items: string[]; // Contoh: ["Define goals", "Research competitors"]
}

interface Message {
  id: number; // ID unik pesan (biasanya timestamp angka)
  role: MessageRole; // Siapa pengirimnya ("user" atau "assistant")
  content: string; // Teks isi pesan utama
  list?: MessageSection[]; // (Opsional) Jika balasan AI memiliki daftar poin terstruktur
  footer?: string; // (Opsional) Kalimat penutup balasan AI
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}
