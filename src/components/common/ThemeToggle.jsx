import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem("theme") || "light";
  });

  // Update theme in localStorage and apply to document when theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);

    // Also add/remove dark class to document for Tailwind dark mode
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className='flex items-center justify-center p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200'
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" ? (
            <MoonIcon className='w-4 h-4 text-primary' />
          ) : (
            <SunIcon className='w-4 h-4 text-yellow-400' />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};
