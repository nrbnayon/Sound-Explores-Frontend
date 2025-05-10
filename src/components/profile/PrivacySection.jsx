import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PrivacySection = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='border-b border-gray-100 py-4'>
      <motion.div
        className='flex justify-between items-center cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className='text-lg font-medium'>{item.title}</h3>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className='p-1 rounded-full hover:bg-gray-100'
        >
          {isOpen ? (
            <ChevronUp className='w-5 h-5 text-muted-foreground' />
          ) : (
            <ChevronDown className='w-5 h-5 text-muted-foreground' />
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden'
          >
            <p className='text-muted-foreground text-sm mt-3 mb-1 leading-relaxed'>
              {item.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
