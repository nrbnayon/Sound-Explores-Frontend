// src\pages\auth\ResetPassword.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar } from "../../components/common/StatusBar";

// Validation schema
const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const success = await resetPassword(data);
      if (success) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            <Link to='/send-code'>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className='p-2 rounded-full hover:bg-gray-100 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
              </motion.div>
            </Link>
            <h1 className='text-xl font-bold'>Reset Password</h1>
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
              <h2 className='text-2xl font-bold mb-2'>Create New Password</h2>
              <p className='text-muted-foreground text-sm'>
                Please create a new secure password for your account.
              </p>
            </div>

            {/* New Password Field */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                New Password
              </label>
              <Card className='shadow-none border border-gray-200'>
                <CardContent className='p-0 relative'>
                  <Input
                    {...register("newPassword")}
                    className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                      errors.newPassword
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                    placeholder='Enter new password...'
                    type={showNewPassword ? "text" : "password"}
                  />
                  <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type='button'
                      onClick={toggleNewPasswordVisibility}
                      className='text-muted-foreground flex items-center justify-center'
                    >
                      {showNewPassword ? (
                        <EyeOff className='w-5 h-5' />
                      ) : (
                        <Eye className='w-5 h-5' />
                      )}
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
              {errors.newPassword && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-destructive text-xs block'
                >
                  {errors.newPassword.message}
                </motion.span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Confirm Password
              </label>
              <Card className='shadow-none border border-gray-200'>
                <CardContent className='p-0 relative'>
                  <Input
                    {...register("confirmPassword")}
                    className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                      errors.confirmPassword
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                    placeholder='Confirm your password...'
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type='button'
                      onClick={toggleNewPasswordVisibility}
                      className='text-muted-foreground flex items-center justify-center'
                    >
                      {showNewPassword ? (
                        <EyeOff className='w-5 h-5' />
                      ) : (
                        <Eye className='w-5 h-5' />
                      )}
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
              {errors.confirmPassword && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-destructive text-xs block'
                >
                  {errors.confirmPassword.message}
                </motion.span>
              )}
            </div>

            {/* Continue Button */}
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
                {loading ? "Processing..." : "Reset Password"}
              </Button>
            </motion.div>
          </motion.div>
        </form>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='p-6 text-center border-t'
        >
          <Link
            to='/send-code'
            className='text-sm text-primary hover:text-blue-800 font-medium'
          >
            Back to verification
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
