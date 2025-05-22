// src/contexts/SelectedSoundContext.jsx
import { createContext, useContext, useState } from "react";

// Create context for selected sound
const SelectedSoundContext = createContext();

export const SelectedSoundProvider = ({ children }) => {
  const [selectedSound, setSelectedSound] = useState(null);

  // Clear selected sound
  const clearSelectedSound = () => {
    setSelectedSound(null);
  };

  // console.log("SelectedSoundProvider - selectedSound:", selectedSound);

  return (
    <SelectedSoundContext.Provider
      value={{
        selectedSound,
        setSelectedSound,
        clearSelectedSound,
      }}
    >
      {children}
    </SelectedSoundContext.Provider>
  );
};

// Custom hook to use the selected sound context
export const useSelectedSound = () => {
  const context = useContext(SelectedSoundContext);
  if (!context) {
    throw new Error(
      "useSelectedSound must be used within a SelectedSoundProvider"
    );
  }
  return context;
};
