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
  const [isPremium, setIsPremium] = useState(false);
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

  // Handle file change
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
        isPremium,
        soundFile: selectedFile,
      });

      // Reset form and close modal on success
      setTitle("");
      setDescription("");
      setCategory("general");
      setIsPremium(false);
      setSelectedFile(null);
      setFileName("");
      onClose();
      toast.success("Sound added successfully!");
    } catch (error) {
      console.error("Error adding sound:", error);
      toast.error("Failed to add sound");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories for sounds - matched with backend soundCategories
  const categories = [
    { value: "Scary", label: "Scary" },
    { value: "Relaxing", label: "Relaxing" },
    { value: "Futuristic", label: "Futuristic" },
    { value: "Celebration", label: "Celebration" },
    { value: "Action", label: "Action" },
    { value: "Romantic", label: "Romantic" },
    { value: "Educational", label: "Educational" },
    { value: "Ambient", label: "Ambient" },
  ];

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className='bg-background border border-border rounded-lg p-6 w-full max-w-md shadow-lg'
      >
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-foreground'>Add New Sound</h2>
          <Button
            onClick={onClose}
            variant='ghost'
            className='p-1 rounded-full h-auto w-auto text-foreground'
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <div className='mb-4'>
            <label
              htmlFor='title'
              className='block text-sm font-medium mb-1 text-foreground'
            >
              Title
            </label>
            <input
              type='text'
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 bg-background border rounded-md text-foreground ${
                errors.title ? "border-destructive" : "border-input"
              }`}
              placeholder='Enter sound title'
            />
            {errors.title && (
              <p className='text-destructive text-xs mt-1'>{errors.title}</p>
            )}
          </div>

          {/* Description input */}
          <div className='mb-4'>
            <label
              htmlFor='description'
              className='block text-sm font-medium mb-1 text-foreground'
            >
              Description
            </label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2 bg-background border rounded-md text-foreground ${
                errors.description ? "border-destructive" : "border-input"
              }`}
              placeholder='Enter sound description'
              rows={3}
            />
            {errors.description && (
              <p className='text-destructive text-xs mt-1'>
                {errors.description}
              </p>
            )}
          </div>

          {/* Category select */}
          <div className='mb-4'>
            <label
              htmlFor='category'
              className='block text-sm font-medium mb-1 text-foreground'
            >
              Category
            </label>
            <select
              id='category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='w-full p-2 bg-background border border-input rounded-md text-foreground'
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Premium toggle */}
          <div className='mb-4'>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='isPremium'
                className='text-sm font-medium text-foreground'
              >
                Premium Content
              </label>
              <label
                className='relative inline-flex items-center cursor-pointer'
                htmlFor='isPremium'
              >
                <input
                  type='checkbox'
                  id='isPremium'
                  checked={isPremium}
                  onChange={() => setIsPremium(!isPremium)}
                  className='sr-only'
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    isPremium ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`${
                      isPremium ? "translate-x-6" : "translate-x-1"
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                  ></div>
                </div>
              </label>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Toggle on to make this sound available only to premium users
            </p>
          </div>

          {/* File upload */}
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-1 text-foreground'>
              Sound File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50 transition-colors ${
                errors.file ? "border-destructive" : "border-input"
              }`}
              onClick={() => document.getElementById("soundFile").click()}
            >
              <input
                type='file'
                id='soundFile'
                accept='audio/*'
                onChange={handleFileChange}
                className='hidden'
              />

              {fileName ? (
                <div className='flex items-center justify-center gap-2 text-sm'>
                  <Music size={20} className='text-primary' />
                  <span className='truncate max-w-[200px] text-foreground'>
                    {fileName}
                  </span>
                </div>
              ) : (
                <div className='py-4'>
                  <Upload
                    size={32}
                    className='mx-auto mb-2 text-muted-foreground'
                  />
                  <p className='text-sm text-muted-foreground'>
                    Click to upload or drag and drop
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    MP3, WAV, or OGG (max 10MB)
                  </p>
                </div>
              )}
            </div>
            {errors.file && (
              <p className='text-destructive text-xs mt-1'>{errors.file}</p>
            )}
          </div>

          {/* Submit button */}
          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              onClick={onClose}
              variant='secondary'
              className='text-secondary-foreground'
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
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
