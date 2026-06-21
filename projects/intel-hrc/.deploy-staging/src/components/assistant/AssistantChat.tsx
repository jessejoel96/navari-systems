"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "What invoices are waiting for CFO approval?",
  "Show unpaid invoices for IOS CIV",
  "Draft a reminder email for overdue approvals",
  "Which entity has the most pending AP?",
  "Summarize this week's AP activity",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col rounded-xl border border-gray-100 bg-white">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-16 text-center">
            <div className="rounded-2xl bg-brand-blue-light p-4">
              <Bot className="h-8 w-8 text-brand-blue" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700">
              AP Assistant
            </p>
            <p className="mt-1 max-w-sm text-xs text-gray-400">
              Ask me anything about your AP workflow — invoice status, supplier queries, payment schedules, or draft follow-up emails.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "assistant"
                    ? "bg-brand-blue-light"
                    : "bg-brand-green-light"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-brand-blue" />
                ) : (
                  <User className="h-4 w-4 text-brand-green" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-gray-50 text-gray-800"
                    : "bg-brand-blue text-white"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-light">
              <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-gray-400" />
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: "0.3s" }} />
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-gray-400" style={{ animationDelay: "0.6s" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about AP workflow..."
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white transition-colors hover:bg-brand-blue-deep disabled:bg-gray-200 disabled:text-gray-400"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
