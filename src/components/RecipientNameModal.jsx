// components/RecipientNameModal.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { X, User } from "lucide-react";

const RecipientNameModal = ({ isOpen, onClose, onConfirm, soundName }) => {
  const [recipientName, setRecipientName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = recipientName.trim() || "Friend";
    onConfirm(name);
    setRecipientName("");
    onClose();
  };

  const handleSkip = () => {
    onConfirm("Friend");
    setRecipientName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Share with...</h3>
              <p className="text-sm text-gray-500">"{soundName}"</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="recipientName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Recipient's Name (Optional)
            </label>
            <input
              id="recipientName"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter name or leave blank for 'Friend'"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleSkip}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Skip
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RecipientNameModal;
