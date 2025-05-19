// src/hooks/useAudioUrlDetector.js
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useAudioUrlDetector = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.startsWith("/play/audios/")) {
      return;
    }
    const audioPathMatch = location.pathname.match(/\/audios\/([\w-]+\.mp3)$/);
    if (audioPathMatch && audioPathMatch[1]) {
      navigate(`/play/audios/${audioPathMatch[1]}`, { replace: true });
    }
  }, [location.pathname, navigate]);
};
