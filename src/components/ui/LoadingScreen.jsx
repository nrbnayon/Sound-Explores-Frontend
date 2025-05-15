import { motion } from "framer-motion";
import { StatusBar } from "../common/StatusBar";

const LoadingScreen = () => {
  return (
    <div className='md:container mx-auto flex justify-center'>
      <div className='w-full md:max-w-md mx-auto z-20'>
        <StatusBar />
      </div>
      <div className='fixed inset-0 flex items-center justify-center bg-card shadow-md z-10'>
        <motion.div
          className='flex flex-col items-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='w-32 h-32 object-cover ml-10 -mb-2'
            alt='Logo'
            src='/logo.png'
          />

          {/* Main animated logo/spinner */}
          <div className='relative w-24 h-24 mb-8'>
            {/* Outer spinning ring */}
            <motion.div
              className='absolute inset-0 rounded-full border-4 border-blue-300 opacity-30'
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.1, opacity: [0.3, 0.5, 0.3] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />

            {/* Middle pulsing ring */}
            <motion.div
              className='absolute inset-0 rounded-full border-4 border-primary'
              initial={{ scale: 0.6 }}
              animate={{
                scale: [0.6, 0.8, 0.6],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />

            {/* Inner rotating circle */}
            <motion.div
              className='absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg'
              animate={{
                rotate: 360,
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 3, ease: "linear" },
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              }}
            />

            {/* Center dot */}
            <motion.div
              className='absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full -ml-1.5 -mt-1.5'
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Skeleton placeholders */}
          <div className='space-y-3 w-64'>
            {/* Skeleton bar 1 - wider */}
            <motion.div
              className='h-2.5 bg-gray-200 rounded-full w-full'
              animate={{
                opacity: [0.5, 0.8, 0.5],
                width: ["100%", "70%", "100%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />

            {/* Skeleton bar 2 - medium */}
            <motion.div
              className='h-2.5 bg-gray-200 rounded-full'
              animate={{
                opacity: [0.5, 0.8, 0.5],
                width: ["80%", "60%", "80%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.3,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />

            {/* Skeleton bar 3 - shorter */}
            <motion.div
              className='h-2.5 bg-gray-200 rounded-full'
              animate={{
                opacity: [0.5, 0.8, 0.5],
                width: ["60%", "40%", "60%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.1,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
          </div>

          {/* Floating dots for additional visual effect */}
          <div className='relative w-40 h-8 mt-8'>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className='absolute top-1/2 w-2 h-2 rounded-full bg-primary'
                style={{ left: `${i * 25}%` }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  },
                  opacity: {
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  },
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
