import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, AlertCircle, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CourseContext, isQuestionWithinScope } from "../services/courseContextService";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AITutorProps {
  courseContext: CourseContext | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const AITutor = ({ courseContext, isOpen = true, onClose }: AITutorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: courseContext
        ? `Hi! I'm your AI tutor for "${courseContext.courseTitle}". I can help you understand the concepts in this course using the Socratic method (asking you guided questions). What would you like to learn about?`
        : "Welcome! Please select a course to start tutoring.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outOfScope, setOutOfScope] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !courseContext) {
      return;
    }

    // Check if question is within scope
    const withinScope = isQuestionWithinScope(courseContext, input);
    if (!withinScope) {
      setOutOfScope(true);
      toast.error("Please ask questions related to this course topic");
      return;
    }

    setOutOfScope(false);

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response with context isolation
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you think through this step by step. Can you first explain what you understand about this concept so far?",
        "Interesting! This relates to the core concepts we've covered. Try to work through this example, and let me know where you get stuck.",
        "Good thinking! You're on the right track. Here's a hint: consider how this principle applies in real-world scenarios.",
        `This is directly related to the topics in "${courseContext.courseTitle}". Let me guide you: What aspects of this do you find most challenging?`,
        "Excellent question! This demonstrates deep learning. The answer involves understanding the foundations we covered earlier. Can you connect the dots?",
      ];

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_resp`,
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800 + Math.random() * 400);
  };

  if (!isOpen) {
    return null;
  }

  if (!courseContext) {
    return (
      <Card className="border border-border/50 bg-gradient-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">AI Tutor</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a course to access your AI tutor with context-isolated learning support.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-gradient-card p-6 h-full flex flex-col max-h-96">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          AI Tutor
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          For: {courseContext.courseTitle}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-xs text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-foreground rounded-bl-none"
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-secondary text-foreground rounded-lg rounded-bl-none px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Out of Scope Warning */}
      {outOfScope && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2"
        >
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">
            Please ask questions related to {courseContext.courseTitle}
          </p>
        </motion.div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask about this topic..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="text-sm"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="sm"
          className="flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        This tutor is trained specifically for this course topic
      </p>
    </Card>
  );
};

export default AITutor;
