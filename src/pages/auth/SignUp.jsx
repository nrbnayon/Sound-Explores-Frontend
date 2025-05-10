// src\pages\auth\SignUp.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeOffIcon, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { StatusBar } from "../../components/common/StatusBar";
import { Helmet } from "react-helmet-async";

// Validation schema
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => /^\d{10,}$/.test(val.replace(/\D/g, "")), {
      message: "Please enter a valid phone number",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

const SignUp = () => {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      agreeToTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    await signUp(data);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='bg-background flex flex-row justify-center w-full min-h-screen'>
      <div className='bg-card w-full max-w-md relative shadow-md'>
        <Helmet>
          <title>Sign Up - Sound Explores App</title>
          <meta
            name='description'
            content='Create a new Sound Explores account'
          />
          <meta property='og:title' content='Sign Up - Sound Explores App' />
          <meta
            property='og:description'
            content='Create a new Sound Explores account'
          />
          <meta
            property='og:image'
            content='https://example.com/og-image-signup.jpg'
          />
          <meta property='og:url' content='https://example.com/signup' />
          <meta property='og:type' content='website' />
        </Helmet>
        <StatusBar />

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10 transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div className='flex items-center'>
            <Link to='/'>
              <motion.div
                whileHover={{ scale: 1.0 }}
                whileTap={{ scale: 0.9 }}
                className='p-2 rounded-full hover:bg-background hover:rounded-full border-gray-400 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
              </motion.div>
            </Link>
            <h1 className='text-xl font-bold'>Sign Up</h1>
          </div>
        </motion.div>

        {/* Logo */}
        <div className='mr-0.5'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col items-center p-6 border-b bg-gradient-to-b from-blue-50 to-white'
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='w-36 h-36 object-cover'
              alt='Logo'
              src='/logo.png'
            />
            <h2 className='text-2xl text-black font-bold mb-1'>
              Create Account
            </h2>
            <p className='text-xs text-muted-foreground'>
              Fill in your details to register
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
          <div className='space-y-4'>
            {/* Name Field */}
            <div className='flex flex-col gap-2'>
              <label className='font-medium text-base'>Name</label>
              <Card className='p-0 w-full border border-solid border-gray-200 shadow-none'>
                <CardContent className='p-0'>
                  <Input
                    {...register("name")}
                    className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    placeholder='Enter your name...'
                  />
                </CardContent>
              </Card>
              {errors.name && (
                <span className='text-destructive text-sm'>
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Phone Field */}
            <div className='flex flex-col gap-2'>
              <label className='font-medium text-base'>Phone number</label>
              <Card className='p-0 w-full border border-solid border-gray-200 shadow-none'>
                <CardContent className='p-0'>
                  <Input
                    {...register("phone")}
                    type='tel'
                    className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                    placeholder='Enter your Phone number...'
                  />
                </CardContent>
              </Card>
              {errors.phone && (
                <span className='text-destructive text-sm'>
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className='flex flex-col gap-2'>
              <label className='font-medium text-base'>Password</label>
              <Card className='p-0 w-full border border-solid border-gray-200 shadow-none'>
                <CardContent className='p-0 flex items-center'>
                  <Input
                    {...register("password")}
                    className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    placeholder='Enter your Password...'
                    type={showPassword ? "text" : "password"}
                  />
                  <div
                    className='absolute right-10 cursor-pointer'
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOffIcon className='w-5 h-5 text-muted-foreground' />
                    ) : (
                      <EyeIcon className='w-5 h-5 text-muted-foreground' />
                    )}
                  </div>
                </CardContent>
              </Card>
              {errors.password && (
                <span className='text-destructive text-sm'>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className='flex items-start gap-2'>
              <Controller
                name='agreeToTerms'
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id='terms'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={`mt-1 w-4 h-4 rounded border-2 ${
                      errors.agreeToTerms ? "border-red-500" : "border-blue-500"
                    }`}
                  />
                )}
              />
              <label
                htmlFor='terms'
                className='cursor-pointer text-sm text-foreground'
              >
                I agree to the processing of personal data and accept the{" "}
                <Link
                  to='/privacy-policy'
                  className='text-primary hover:underline'
                >
                  Terms of Service & Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <span className='text-destructive text-sm block mt-1'>
                {errors.agreeToTerms.message}
              </span>
            )}

            {/* Sign Up Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type='submit'
                className='w-full py-3 bg-primary rounded-full text-white font-medium hover:bg-blue-600 transition-colors'
              >
                Sign Up
              </Button>
            </motion.div>

            {/* Already have an account */}
            <div className='flex items-center justify-center gap-1 mt-2'>
              <p className='text-foreground text-sm'>
                Already have an account?
              </p>
              <Link to='/' className='font-medium text-blue-500 text-sm'>
                Sign In
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
