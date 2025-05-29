// components/ShareModal.jsx
import { motion } from "framer-motion";
import {
  X,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageSquare,
  Copy,
  Share2,
} from "lucide-react";
import { Button } from "./ui/button";
import { useNativeShare } from "../hooks/useNativeShare";

const ShareModal = ({ isOpen, onClose, shareData }) => {
  const { copyToClipboard } = useNativeShare();

  if (!isOpen) return null;

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodeURIComponent(shareData.text)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-500 hover:bg-blue-600",
      url: `https://t.me/share/url?text=${encodeURIComponent(shareData.text)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareData.url
      )}&quote=${encodeURIComponent(shareData.text)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareData.text
      )}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareData.url
      )}&summary=${encodeURIComponent(shareData.text)}`,
    },
    {
      name: "Messages",
      icon: MessageSquare,
      color: "bg-green-600 hover:bg-green-700",
      url: `sms:?body=${encodeURIComponent(shareData.text)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(
        shareData.title
      )}&body=${encodeURIComponent(shareData.text)}`,
    },
  ];

  const handleShareClick = (url, name) => {
    // Use the complete formatted message for all platforms
    const fullMessage = shareData.text; 

    // console.log(`Sharing via ${name}:`, fullMessage);

    // Create proper share URLs with the formatted message
    let shareUrl;

    switch (name) {
      case "WhatsApp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
        break;
      case "Telegram":
        shareUrl = `https://t.me/share/url?text=${encodeURIComponent(
          fullMessage
        )}`;
        break;
      case "Facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareData.url
        )}&quote=${encodeURIComponent(fullMessage)}`;
        break;
      case "Twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          fullMessage
        )}`;
        break;
      case "LinkedIn":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareData.url
        )}&summary=${encodeURIComponent(fullMessage)}`;
        break;
      case "Messages":
        shareUrl = `sms:?body=${encodeURIComponent(fullMessage)}`;
        break;
      case "Email":
        shareUrl = `mailto:?subject=${encodeURIComponent(
          shareData.title
        )}&body=${encodeURIComponent(fullMessage)}`;
        break;
      default:
        shareUrl = url;
    }

    // Handle mobile app detection and opening
    if (
      name === "WhatsApp" &&
      /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
    ) {
      const whatsappApp = `whatsapp://send?text=${encodeURIComponent(
        shareData.text
      )}`;
      window.location.href = whatsappApp;
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }, 500);
    } else if (
      name === "Telegram" &&
      /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
    ) {
      const telegramApp = `tg://msg_url?text=${encodeURIComponent(
        shareData.text
      )}`;
      window.location.href = telegramApp;
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }, 500);
    } else if (name === "Messages" || name === "Email") {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };
  

  const handleCopyLink = () => {
    copyToClipboard(shareData.text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:w-auto sm:min-w-[400px] max-w-md mx-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Share Sound</h3>
              <p className="text-sm text-gray-500">{shareData.title}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            variant="ghost"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {shareOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <motion.button
                key={option.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShareClick(option.url, option.name)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div
                  className={`p-3 rounded-full ${option.color} text-white transition-colors`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  {option.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Copy Link Section */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Share Link
              </p>
              <p className="text-xs text-gray-500 truncate">
                {shareData.text.split("\n")[0]}...
              </p>
            </div>
            <Button
              onClick={handleCopyLink}
              className="flex-shrink-0 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareModal;
