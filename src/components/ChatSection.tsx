import React from "react";
import { Send } from "lucide-react";
import { ChatMessage, CarbonResult } from "../types";

export interface ChatSectionProps {
  chatHistory: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  chatLoading: boolean;
  handleSendChat: (e: React.FormEvent) => void;
  result: CarbonResult | null;
  renderMarkdownText: (text: string) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  chatHistory,
  chatInput,
  setChatInput,
  chatLoading,
  handleSendChat,
  result,
  renderMarkdownText,
  messagesEndRef,
}) => {
  return (
    <div className="bg-white border-2 border-emerald-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-[620px] max-w-4xl mx-auto w-full dark:bg-slate-900 dark:border-slate-800">
      {/* Chat header */}
      <h3 className="sr-only">Sustaina Carbon Coach Conversations</h3>
      <header className="p-4 bg-emerald-900 text-white flex items-center justify-between shadow-xs dark:bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-emerald-400 text-emerald-950 rounded-2xl flex items-center justify-center text-xl font-bold">
            S
          </div>
          <div>
            <h4 id="coach-title" className="font-black text-sm tracking-tight">Sustaina Carbon Coach</h4>
            <p className="text-[10px] text-emerald-300 flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ask anything about preservation, food energy, or transport
            </p>
          </div>
        </div>

        <div className="text-[10.5px] font-mono bg-emerald-800 dark:bg-slate-800 px-2.5 py-1 rounded">
          Score sync context: {result ? `${result.carbonScore} PTS` : "No run logged"}
        </div>
      </header>

      {/* Chat Messages flow thread list with screen-reader lifecycle support */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20"
        aria-live="polite"
        aria-busy={chatLoading}
        aria-label="Conversation Thread"
      >
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none"
              }`}
            >
              {msg.role === "model" ? (
                renderMarkdownText(msg.content)
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Loader response state */}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-none p-4 max-w-[85%] shadow-xs flex items-center gap-2 text-xs text-slate-400">
              <svg
                className="animate-spin h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Sustaina is compiling sustainable insights...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt questions shortcuts */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto text-[10.5px] whitespace-nowrap bg-white dark:bg-slate-900">
        <button
          onClick={() => setChatInput("What daily activities contribute most to my footprint?")}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer text-slate-500 hover:text-emerald-600 transition-all dark:text-slate-400"
        >
          🌍 Main drivers?
        </button>
        <button
          onClick={() => setChatInput("Give me simple hacks to save electricity at home")}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer text-slate-500 hover:text-emerald-600 transition-all dark:text-slate-400"
        >
          💡 Save electricity hacks?
        </button>
        <button
          onClick={() => setChatInput("Are electric vehicles really zero carbon emissions?")}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer text-slate-500 hover:text-emerald-600 transition-all dark:text-slate-400"
        >
          🚗 Electric vehicle truth?
        </button>
      </div>

      {/* Chat user text submit */}
      <form
        onSubmit={handleSendChat}
        className="p-3 bg-slate-50 border-t border-slate-150 dark:bg-slate-950 dark:border-slate-850 flex gap-2"
        role="search"
        aria-label="Eco search"
      >
        <input
          type="text"
          className="flex-1 p-3 text-xs sm:text-sm border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400"
          placeholder="Ask Sustaina how to make cleaner environment choices..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={chatLoading || !chatInput.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 px-4 rounded-xl cursor-pointer shadow disabled:opacity-50 flex items-center justify-center text-xs"
          aria-label="Send message to Sustaina"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
