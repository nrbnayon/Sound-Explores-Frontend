// src\pages\auth\SendOtp.jsx
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { StatusBar } from "../../components/common/StatusBar";

// Validation schema
const otpSchema = z.object({
  otp: z.string().length(4, "OTP must be 4 digits"),
});

const SendOtp = () => {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("infogmaila@gmail.com");
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // State for OTP digits
  const [otp, setOtp] = useState(["", "", "", ""]);

  // References for OTP input fields
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Timer for resend code functionality
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [timer, isTimerActive]);

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value;

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    // Update the OTP digits array
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take the first character
    setOtp(newOtp);

    // Move focus to next input if current input is filled
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle key down events for backspace
  const handleKeyDown = (e, index) => {
    // Move focus to previous input when backspace is pressed on an empty input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      const success = await verifyOtp(otpValue);
      if (success) {
        navigate("/reset-password");
      }
    }
  };

  // Handle resend code
  const handleResendCode = () => {
    if (!isTimerActive) {
      console.log("Resending code to", email);
      // Reset OTP fields
      setOtp(["", "", "", ""]);
      // Reset timer
      setTimer(60);
      setIsTimerActive(true);
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
          className={`flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10 transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div className='flex items-center'>
            <Link to='/forget-password'>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className='p-2 rounded-full hover:bg-gray-100 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
              </motion.div>
            </Link>
            <h1 className='text-xl font-bold'>Verify OTP</h1>
          </div>
        </motion.div>

        {/* Logo */}
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
          <h2 className='text-2xl font-bold mb-1'>Verification Code</h2>
          <p className='text-xs text-muted-foreground'>
            We sent a code to {email}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className='p-6'>
          <div className='space-y-6'>
            {/* OTP Input Fields */}
            <div className='flex justify-center gap-3 mb-6'>
              {otp.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='w-14 h-14 border border-gray-200 rounded-lg flex items-center justify-center bg-card shadow-sm'
                >
                  <input
                    ref={inputRefs[index]}
                    type='text'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className='w-full h-full text-center text-2xl font-semibold border-none focus:outline-none focus:ring-0'
                    autoFocus={index === 0}
                  />
                </motion.div>
              ))}
            </div>

            {/* Timer and Resend */}
            <div className='text-center'>
              <button
                type='button'
                onClick={handleResendCode}
                disabled={isTimerActive}
                className={`text-sm font-medium ${
                  isTimerActive
                    ? "text-muted-foreground"
                    : "text-blue-500 cursor-pointer"
                }`}
              >
                {isTimerActive ? `Resend Code (${timer}s)` : "Resend Code"}
              </button>
            </div>

            {/* Verify Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type='submit'
                className='w-full py-3 bg-primary rounded-full text-white font-medium hover:bg-blue-600 transition-colors'
                disabled={otp.join("").length !== 4}
              >
                Verify Code
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendOtp;
