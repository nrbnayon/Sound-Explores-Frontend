// src/pages/app/AudioPlayer/AudioPlayerPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        <main className='md:container mx-auto flex justify-center'>
          <div className='w-full md:max-w-md'>
            <StatusBar />
            <AudioPlayerModal audioUrl={audioUrl} onClose={handleClose} />
          </div>
        </main>
      )}
    </>
  );
};

export default AudioPlayerPage;
