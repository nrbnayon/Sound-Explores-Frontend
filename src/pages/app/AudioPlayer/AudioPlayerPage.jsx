// src/pages/app/AudioPlayer/AudioPlayerPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AudioPlayerModal from "../../../components/AudioPlayer/AudioPlayerModal";
import { StatusBar } from "../../../components/common/StatusBar";

const AudioPlayerPage = () => {
  const { audioPath } = useParams();
  const [audioUrl, setAudioUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (audioPath) {
      const assetsUrl = import.meta.env.VITE_ASSETS_URL || "";
      setAudioUrl(`${assetsUrl}/audios/${audioPath}`);
    }
  }, [audioPath]);

  const handleClose = () => {
    navigate("/sound-library");
  };

  return (
    <>
      {audioUrl && (
        <main className="md:container mx-auto flex justify-center">
          <div className="w-full md:max-w-md">
            {/* <StatusBar /> */}
            <div className="mr-0.5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center p-6 border-b bg-background"
              >
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-44 h-44 object-cover"
                  alt="Logo"
                  src="/logo.png"
                />
                <h2 className="text-2xl text-black dark:text-white font-bold mb-1">
                  Welcome! Enjoy the sound!
                </h2>
              </motion.div>
            </div>
            <AudioPlayerModal
              audioUrl={audioUrl}
              onClose={handleClose}
              autoplay={true}
            />
          </div>
        </main>
      )}
    </>
  );
};

export default AudioPlayerPage;
