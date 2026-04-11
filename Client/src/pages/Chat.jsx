import { useState, useRef, useEffect } from "react";
import api from "../api/client";

function EmergencyBanner({ data }) {
  return (
    <div className="emergency-pulse bg-red-600 text-white rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🚨</span>
        <span className="font-bold text-lg">EMERGENCY DETECTED</span>
      </div>
      <p className="text-sm mb-2">{data.condition}</p>
      <p className="font-semibold text-sm mb-1">Immediate action: {data.action}</p>
      {data.emergencyNumbers && (
        <div className="mt-2 text-xs">
          <p className="font-medium mb-1">Emergency Numbers:</p>
          {Object.entries(data.emergencyNumbers).map(([k, v]) => (
            <span key={k} className="mr-3">{k}: <strong>{v}</strong></span>
          ))}
        </div>
      )}
    </div>
  );
}

function RedFlags({ flags }) {
  if (!flags?.length) return null;
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-3">
      <p className="text-orange-700 dark:text-orange-400 font-semibold text-sm mb-1">⚠️ Red Flag Symptoms Detected</p>
      {flags.map((f) => (
        <p key={f.symptom} className="text-xs text-orange-600 dark:text-orange-400">• {f.warning}</p>
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`chat-bubble flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm shrink-0 mr-2 mt-1">
          🤖
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {msg.emergency && <EmergencyBanner data={msg.emergency} />}
        {msg.redFlags && <RedFlags flags={msg.redFlags} />}
        <div
          className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm"
          }`}
        >
          {msg.content}
        </div>
        {msg.confidence && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Confidence: <strong>{msg.confidence.level}</strong> ({Math.round(msg.confidence.score * 100)}%)
            </span>
          </div>
        )}
        {msg.extracted?.symptoms?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {msg.extracted.symptoms.map((s) => (
              <span key={s} className="badge-blue text-xs">{s}</span>
            ))}
          </div>
        )}
        {msg.recommendations?.seekProfessionalHelp && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">👨‍⚕️ Professional consultation recommended</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm shrink-0 ml-2 mt-1">
          👤
        </div>
      )}
    </div>
  );
}

const SUGGESTIONS = [
  "I have a headache and fever",
  "I've been feeling tired and short of breath",
  "I have chest pain",
  "My throat is sore and I'm coughing",
];

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I'm your HealthAI assistant. Describe your symptoms or ask any health-related question, and I'll provide guidance. Remember, I'm an AI — always consult a doctor for serious concerns.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get("/chat/history?limit=30")
      .then(({ data }) => {
        const history = (data.chats || []).reverse().flatMap((c) => [
          { role: "user", content: c.userMessage, timestamp: new Date(c.createdAt) },
          { role: "ai", content: c.aiResponse, timestamp: new Date(c.createdAt) },
        ]);
        if (history.length > 0) {
          setMessages((prev) => [...prev, ...history]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post("/chat/symptoms", { message: text });

      const aiMsg = {
        role: "ai",
        content: data.isEmergency
          ? (data.emergency?.immediateAdvice || "EMERGENCY — call emergency services immediately!")
          : data.response,
        timestamp: new Date(),
        emergency: data.isEmergency ? data.emergency : null,
        redFlags: data.redFlags,
        confidence: data.confidence,
        extracted: data.extracted,
        recommendations: data.recommendations,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: err.response?.data?.message || "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {loadingHistory && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-4">Loading history...</p>
        )}
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm shrink-0 mr-2">
              🤖
            </div>
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-2 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="shrink-0 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Describe your symptoms..."
            className="flex-1 input-field resize-none min-h-[42px] max-h-32"
            style={{ height: "auto" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-primary px-5 py-2.5 shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
          AI guidance only — not a substitute for professional medical advice
        </p>
      </div>
    </div>
  );
}
