// src\pages\auth\SignIn.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { StatusBar } from "../../components/common/StatusBar";
import { Helmet } from "react-helmet-async";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Email is invalid")
    .transform((val) => val.replace(/\s+/g, "").toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const SignIn = () => {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    const submitData = {
      ...data,
      email: data.email.replace(/\s+/g, "").toLowerCase(),
    };
    await signIn(submitData);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-background flex flex-col w-full min-h-screen shadow-md">
      {/* StatusBar fixed at top */}
      {/* <StatusBar /> */}

      <Helmet>
        <title>Sign In - Poop Alert</title>
        <meta
          name="description"
          content="Login to your Sound Explores account"
        />
        <meta property="og:title" content="Sign In - Poop Alert" />
        <meta
          property="og:description"
          content="Login to your Sound Explores account"
        />
        <meta
          property="og:image"
          content="https://i.postimg.cc/HkHXj7zF/logo.png"
        />
        <meta property="og:url" content="https://poopalert.fun/signin" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Centered content */}
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-card w-full max-w-md relative my-4">
          {/* Logo */}
          <div className="mr-0.5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center p-6 border-b bg-background"
            >
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-44 h-44 object-cover"
                alt="Logo"
                src="/logo.png"
              />
              <h2 className="text-2xl text-black dark:text-white font-bold mb-1">
                Welcome Back
              </h2>
              <p className="text-xs text-muted-foreground">
                Login to your account to continue
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-base">Email</label>
                <Card className="p-0 w-full border border-solid border-gray-200 shadow-none">
                  <CardContent className="p-0">
                    <Input
                      {...register("email")}
                      className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your Email..."
                      onChange={(e) => {
                        e.target.value = e.target.value
                          .replace(/\s+/g, "")
                          .toLowerCase();
                        register("email").onChange(e);
                      }}
                    />
                  </CardContent>
                </Card>
                {errors.email && (
                  <span className="text-destructive text-sm">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-base">Password</label>
                <Card className="p-0 w-full border border-solid border-gray-200 shadow-none">
                  <CardContent className="p-0 flex items-center">
                    <Input
                      {...register("password")}
                      className={`border-none px-4 py-3 h-auto text-foreground text-sm ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your Password..."
                      type={showPassword ? "text" : "password"}
                    />
                    <div
                      className="absolute right-10 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
                {errors.password && (
                  <span className="text-destructive text-sm">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Remember Me & Forget Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-4 h-4 rounded border-2 border-blue-500"
                      />
                    )}
                  />
                  <label
                    htmlFor="remember-me"
                    className="cursor-pointer text-sm text-foreground"
                  >
                    Remember Me
                  </label>
                </div>

                <Link
                  to="/forget-password"
                  className="font-medium text-blue-500 text-sm"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  className="w-full py-3 bg-primary rounded-full text-white font-medium hover:bg-blue-600 transition-colors"
                >
                  Sign In
                </Button>
              </motion.div>

              {/* Sign Up Link */}
              <div className="flex items-center justify-center gap-1 mt-2">
                <p className="text-foreground text-sm">
                  Don't have an account?
                </p>
                <Link
                  to="/signup"
                  className="font-medium text-blue-500 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
