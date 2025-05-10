import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const redirectPath = isAuthenticated ? "/sound-library" : "/";

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full bg-card p-8 rounded-lg shadow-md text-center'
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className='text-6xl font-bold text-primary mb-4'>404</h1>
          <h2 className='text-2xl font-semibold mb-4'>Page Not Found</h2>
          <p className='text-muted-foreground mb-8'>
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to={redirectPath}
            className='inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition'
          >
            <ArrowLeft className='mr-2 h-5 w-5' />
            Go Back
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
