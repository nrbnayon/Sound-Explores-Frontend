// src\components\Sounds\SoundModal.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { X, Upload, Music } from "lucide-react";
import { useAddSound } from "../../hooks/useSound";
import toast from "react-hot-toast";

const SoundModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const addSoundMutation = useAddSound();

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!selectedFile) newErrors.file = "Sound file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check if file is audio
      if (!file.type.startsWith("audio/")) {
        toast.error("Please select an audio file");
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setErrors({ ...errors, file: undefined });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await addSoundMutation.mutateAsync({
        title,
        description,
        category,
        soundFile: selectedFile,
      });

      // Reset form and close modal on success
      setTitle("");
      setDescription("");
      setCategory("general");
      setSelectedFile(null);
      setFileName("");
      onClose();
    } catch (error) {
      console.error("Error adding sound:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories for sounds
  const categories = [
    { value: "general", label: "General" },
    { value: "nature", label: "Nature" },
    { value: "ambient", label: "Ambient" },
    { value: "music", label: "Music" },
    { value: "effects", label: "Sound Effects" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Sound</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="p-1 rounded-full h-auto w-auto"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter sound title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description input */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter sound description"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category select */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* File upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Sound File</label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                errors.file ? "border-red-500" : "border-gray-300"
              }`}
              onClick={() => document.getElementById("soundFile").click()}
            >
              <input
                type="file"
                id="soundFile"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Music size={20} className="text-primary" />
                  <span className="truncate max-w-[200px]">{fileName}</span>
                </div>
              ) : (
                <div className="py-4">
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    MP3, WAV, or OGG (max 10MB)
                  </p>
                </div>
              )}
            </div>
            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file}</p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-blue-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Sound"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SoundModal;
