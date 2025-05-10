// src\pages\auth\ForgetPassword.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar } from "../../components/common/StatusBar";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgetPassword = () => {
  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const success = await sendPasswordResetEmail(data.email);
      if (success) {
        navigate("/send-code");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-background flex flex-row justify-center w-full min-h-screen'>
      <div className='bg-card w-full max-w-md relative shadow-md'>
        <StatusBar />

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10'
        >
          <div className='flex items-center'>
            <Link to='/'>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className='p-2 rounded-full hover:bg-gray-100 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
              </motion.div>
            </Link>
            <h1 className='text-xl font-bold'>Forgot Password</h1>
          </div>
        </motion.div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col p-6 gap-6'
        >
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className='flex justify-center items-center'
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='w-32 h-32 object-contain'
              alt='Logo'
              src='/logo.png'
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className='space-y-6'
          >
            <div>
              <h2 className='text-2xl font-bold mb-2'>Forgot Password?</h2>
              <p className='text-muted-foreground text-sm'>
                Enter your email address and we'll send you a code to reset your
                password.
              </p>
            </div>

            {/* Email Field */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Email
              </label>
              <Card className='shadow-none border border-gray-200'>
                <CardContent className='p-0'>
                  <Input
                    {...register("email")}
                    className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                      errors.email
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                    placeholder='Enter your email...'
                  />
                </CardContent>
              </Card>
              {errors.email && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-destructive text-xs block'
                >
                  {errors.email.message}
                </motion.span>
              )}
            </div>

            {/* Send Code Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button
                type='submit'
                disabled={loading}
                className='w-full py-3 bg-primary hover:bg-blue-600 text-white rounded-full font-medium transition-colors'
              >
                {loading ? "Sending..." : "Send Code"}
              </Button>
            </motion.div>
          </motion.div>
        </form>

        {/* Back to Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='p-6 text-center border-t'
        >
          <Link
            to='/'
            className='text-sm text-primary hover:text-blue-800 font-medium'
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgetPassword;
