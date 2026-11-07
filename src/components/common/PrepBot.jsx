
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  SmartToy,
  Close,
  Send,
  AutoAwesome,
  Delete,
  ChatBubble,
  Psychology,
  Lightbulb,
  TrendingUp,
} from "@mui/icons-material";

// Suggested prompts
const suggestions = [
  {
    label: "Interview tips",
    icon: Lightbulb,
    prompt: "Give me some important interview preparation tips.",
  },
  {
    label: "Technical questions",
    icon: Psychology,
    prompt: "Give me common technical interview questions.",
  },
  {
    label: "Improve my skills",
    icon: TrendingUp,
    prompt: "How can I improve my interview performance?",
  },
];

const initialMessage = {
  id: 1,
  sender: "bot",
  text: "Hey there! 👋 I'm PrepBot, your personal interview preparation assistant. I can help you prepare for interviews, understand technical concepts, improve your answers, and build confidence. What would you like to work on today?",
};

// Demo response engine
function getBotResponse(message) {
  const text = message.toLowerCase().trim();

  // Greeting detection: avoids accidental matches inside other words
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)) {
    return "Hey! Great to see you. 😊 What are you preparing for today? I can help with interview questions, technical concepts, resume tips, or preparation strategies.";
  }

  if (/\b(resume|cv)\b/.test(text)) {
    return `A strong resume should be clear, concise, and achievement-focused.

Here are some tips:

1. Write a professional summary tailored to your target role.
2. Highlight relevant technical skills.
3. Include projects with technologies and measurable outcomes.
4. Add internships and relevant experience.
5. Use simple headings and an ATS-friendly layout.

You can use the Resume Builder in PrepCoach to organize your details.`;
  }

  if (/\b(technical|coding|programming|data structure|algorithm|sql)\b/.test(text)) {
    return `Here are some important areas to prepare for technical interviews:

• Data Structures and Algorithms
• Object-Oriented Programming
• Database Management and SQL
• Operating Systems
• Computer Networks
• Programming language fundamentals
• Projects and practical problem-solving

Try explaining your approach before writing code.

Would you like me to give you a practice question?`;
  }

  if (/\b(behavioral|hr|strength|weakness|teamwork)\b/.test(text)) {
    return `For HR and behavioral interviews, prepare examples about teamwork, challenges, leadership, and problem-solving.

A useful framework is STAR:

• Situation – Describe the context.
• Task – Explain your responsibility.
• Action – Describe what you did.
• Result – Share the outcome.

Keep your examples specific and honest.`;
  }

  if (/\b(tip|prepare|preparation|study plan)\b/.test(text)) {
    return `Here are five practical interview preparation tips:

1. Research the company and job description.
2. Revise the fundamentals of your technical domain.
3. Practice explaining your projects clearly.
4. Take mock interviews under time limits.
5. Review your mistakes and work on weak areas.

Consistency matters more than studying everything at once!`;
  }

  if (/\b(improve|performance|confidence|communication)\b/.test(text)) {
    return `To improve your interview performance:

• Practice speaking your answers aloud.
• Structure answers with clear examples.
• Work on communication and confidence.
• Review feedback after every mock interview.
• Focus on weak technical areas.
• Track your progress over time.

Start with one mock interview and identify two areas to improve.`;
  }

  if (/\b(question|practice|mock interview)\b/.test(text)) {
    return `Let's practice! Here are three common interview questions:

1. Tell me about yourself.
2. Explain a challenging technical project you have worked on.
3. How do you approach solving a problem you have never encountered before?

Try answering one at a time. Explain your reasoning and use examples where possible.`;
  }

  if (/\b(thank|thanks|thankyou)\b/.test(text)) {
    return "You're welcome! 😊 Keep practicing and stay consistent. Every interview is an opportunity to learn something new.";
  }

  return `That's an interesting question!

I'm currently running in frontend demo mode, so my responses are based on a limited set of interview-preparation topics.

I can currently help with:

• Interview preparation tips
• Technical interview topics
• HR and behavioral questions
• Resume improvement
• Interview performance strategies

Once we connect the AI backend, I'll be able to provide more personalized answers.`;
}

export default function PrepBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Close chatbot using Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Clear pending timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Send message
  const sendMessage = (text = input) => {
    const messageText = text.trim();

    if (!messageText || isTyping) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: messageText,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);

    timerRef.current = window.setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: getBotResponse(messageText),
      };

      setMessages((previous) => [...previous, botMessage]);
      setIsTyping(false);
      timerRef.current = null;
    }, 900);
  };

  // Clear conversation
  const clearChat = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setMessages([initialMessage]);
    setIsTyping(false);
    setInput("");
  };

  // Enter to send, Shift + Enter for new line
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
              fixed bottom-24 right-3 z-[60]
              flex h-[min(590px,calc(100dvh-125px))]
              w-[min(390px,calc(100vw-24px))]
              flex-col overflow-hidden rounded-3xl
              border border-[var(--border-color)]
              bg-[var(--bg-secondary)]
              shadow-2xl shadow-black/20
              sm:right-6
            "
            role="dialog"
            aria-modal="false"
            aria-label="PrepBot chat assistant"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#ed3030] to-[#a91616] px-5 py-4 text-white">
              <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                    <SmartToy sx={{ fontSize: 25 }} />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#c72525] bg-green-400" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">PrepBot</h3>
                      <AutoAwesome sx={{ fontSize: 14 }} />
                    </div>
                    <p className="mt-0.5 text-[10px] text-white/75">
                      Your Interview Assistant
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    title="Clear conversation"
                    aria-label="Clear conversation"
                  >
                    <Delete sx={{ fontSize: 19 }} />
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    title="Close chat"
                    aria-label="Close PrepBot"
                  >
                    <Close sx={{ fontSize: 19 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 space-y-4 overflow-y-auto bg-[var(--bg-primary)] p-4"
              aria-live="polite"
              aria-relevant="additions"
            >
              <div className="flex justify-center">
                <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1 text-[9px] text-[var(--text-muted)]">
                  YOUR PERSONAL PREPARATION ASSISTANT
                </span>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#ff5555]">
                      <SmartToy sx={{ fontSize: 18 }} />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[82%] rounded-2xl px-3.5 py-3
                      ${
                        message.sender === "user"
                          ? "rounded-br-sm bg-gradient-to-br from-[#ef4444] to-[#bd2020] text-white"
                          : "rounded-bl-sm border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                      }
                    `}
                  >
                    <p className="whitespace-pre-line break-words text-xs leading-[1.7]">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-[#ff5555]">
                    <SmartToy sx={{ fontSize: 18 }} />
                  </div>

                  <div className="flex items-center gap-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            {messages.length === 1 && (
              <div className="shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 pb-3 pt-3">
                <p className="mb-2 text-[10px] font-semibold text-[var(--text-muted)]">
                  TRY ASKING
                </p>

                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => {
                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.label}
                        onClick={() => sendMessage(suggestion.prompt)}
                        disabled={isTyping}
                        className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] px-2.5 py-2 text-[10px] text-[var(--text-secondary)] transition-all hover:border-red-500/40 hover:bg-red-500/5 hover:text-[#ff5555] disabled:opacity-50"
                      >
                        <Icon sx={{ fontSize: 13 }} />
                        {suggestion.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-2 transition-colors focus-within:border-red-500/50">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask PrepBot anything..."
                  rows={1}
                  maxLength={1000}
                  className="max-h-24 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-xs leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  aria-label="Type your message"
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ef4444] to-[#b91c1c] text-white shadow-md shadow-red-500/20 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send sx={{ fontSize: 17 }} />
                </button>
              </div>

              <p className="mt-2 text-center text-[9px] text-[var(--text-muted)]">
                PrepBot Demo · AI integration coming soon
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((previous) => !previous)}
        className="
          fixed bottom-5 right-5 z-[60]
          flex h-14 w-14 items-center justify-center
          rounded-2xl border border-white/20
          bg-gradient-to-br from-[#ff5555] to-[#a91616]
          text-white shadow-xl shadow-red-500/30
          transition-shadow hover:shadow-red-500/50
          sm:bottom-6 sm:right-6
        "
        aria-label={isOpen ? "Close PrepBot" : "Open PrepBot"}
        aria-expanded={isOpen}
        title="Chat with PrepBot"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Close sx={{ fontSize: 25 }} />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChatBubble sx={{ fontSize: 25 }} />
            </motion.span>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--bg-primary)] bg-green-500">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        )}
      </motion.button>
    </>
  );
}
