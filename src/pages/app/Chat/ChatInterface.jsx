import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { StatusBar } from "../../../components/common/StatusBar";

const ChatInterface = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);

  const toggleKeyboard = () => {
    setIsKeyboardOpen(!isKeyboardOpen);
  };

  const hideKeyboard = () => {
    setIsKeyboardOpen(false);
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isSent: true }]);
      setMessage("");
      hideKeyboard();

      // Simulate reply after a short delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thanks for your message!",
            isSent: false,
          },
        ]);
      }, 1000);
    }
  };

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Virtual keyboard key press
  const handleKeyPress = (key) => {
    if (key === "backspace") {
      setMessage((prev) => prev.slice(0, -1));
    } else if (key === "space") {
      setMessage((prev) => prev + " ");
    } else if (key === "enter") {
      handleSend();
    } else {
      setMessage((prev) => prev + key);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background w-full mx-auto relative overflow-hidden">
      {/* Status bar */}
      <StatusBar />

      {/* Header */}
      <Link
        to="/all-friends"
        className="bg-card p-3 flex items-center border-b border-gray-200"
      >
        <ArrowLeft size={24} className="text-foreground" />
        <div className="ml-4 font-medium text-lg">Jane Cooper</div>
      </Link>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto scroll-container"
        style={{ paddingBottom: isKeyboardOpen ? "240px" : "60px" }}
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`max-w-xs mb-2 p-3 rounded-lg ${
              msg.isSent
                ? "bg-primary text-white ml-auto rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      {/* Message input */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 pb-2">
        <div className="bg-gray-800 px-3 py-2 flex items-center">
          <div
            className="bg-gray-700 flex-1 rounded-full py-2 px-4 text-gray-200 flex items-center cursor-text"
            onClick={toggleKeyboard}
          >
            {message ? message : "Text your message..."}
            {/* <div className="ml-auto">
              <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="2" height="16" />
                  <rect x="8" y="4" width="2" height="16" />
                  <rect x="12" y="4" width="2" height="16" />
                  <rect x="16" y="4" width="2" height="16" />
                  <rect x="20" y="4" width="2" height="16" />
                </svg>
              </div>
            </div> */}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="ml-2 rounded-full w-10 h-10 bg-primary flex items-center justify-center"
            onClick={handleSend}
          >
            <Send size={20} className="text-white" />
          </motion.button>
        </div>

        {/* Virtual Keyboard */}
        {isKeyboardOpen && (
          <motion.div
            initial={{ y: 240 }}
            animate={{ y: 0 }}
            exit={{ y: 240 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 p-1"
          >
            <div className="grid grid-cols-10 gap-1 mb-1">
              {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gray-700 text-white rounded p-2 text-center"
                  onClick={() => handleKeyPress(key)}
                >
                  {key}
                </motion.button>
              ))}
            </div>
            <div className="grid grid-cols-10 gap-1 mb-1">
              <div className="col-span-0.5"></div>
              {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gray-700 text-white rounded p-2 text-center"
                  onClick={() => handleKeyPress(key)}
                >
                  {key}
                </motion.button>
              ))}
              <div className="col-span-0.5"></div>
            </div>
            <div className="grid grid-cols-10 gap-1 mb-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-600 text-white rounded p-2 text-center flex items-center justify-center col-span-1.5"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </motion.button>
              {["z", "x", "c", "v", "b", "n", "m"].map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gray-700 text-white rounded p-2 text-center"
                  onClick={() => handleKeyPress(key)}
                >
                  {key}
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-600 text-white rounded p-2 text-center flex items-center justify-center col-span-1.5"
                onClick={() => handleKeyPress("backspace")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </motion.button>
            </div>
            <div className="grid grid-cols-10 gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-600 text-white rounded p-2 col-span-1.5 flex items-center justify-center"
              >
                ?123
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-600 text-white rounded p-2 flex items-center justify-center"
              >
                @
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-700 text-white rounded col-span-5 p-2"
                onClick={() => handleKeyPress("space")}
              >
                Space
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-600 text-white rounded p-2 flex items-center justify-center"
              >
                .
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="bg-gray-600 text-white rounded p-2 col-span-1.5 flex items-center justify-center"
                onClick={() => handleKeyPress("enter")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
            <div className="flex justify-center mt-1">
              <div className="bg-gray-600 h-1 w-32 rounded"></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
