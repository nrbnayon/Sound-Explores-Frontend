import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { StatusBar } from "../../components/common/StatusBar";
import { toast } from "react-hot-toast";
import { ROUTES } from "../../config/constants";

// Validation schema
const otpSchema = z.object({
  otp: z.string().length(4, "OTP must be exactly 4 digits"),
});

const SendOtp = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otp, setOtp] = useState(["", "", "", ""]);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      navigate(ROUTES.SIGNUP);
      toast.error("Please complete signup first");
    }
  }, [location.state, navigate]);

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
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle key down events for backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle pasting OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs[3].current.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    const otpValue = otp.join("");
    try {
      otpSchema.parse({ otp: otpValue });
    } catch (validationError) {
      setError(validationError.errors[0].message);
      return;
    }
    try {
      setIsSubmitting(true);
      const success = await verifyOtp(email, otpValue);
      if (success) {
        navigate(ROUTES.SIGNIN);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Verification failed. Please try again with a valid code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!isTimerActive && email) {
      try {
        const success = await resendOtp(email);

        if (success) {
          setOtp(["", "", "", ""]);
          setTimer(60);
          setIsTimerActive(true);
          setError("");
          inputRefs[0].current.focus();
        }
      } catch (error) {
        console.error("Failed to resend code:", error);
        toast.error("Failed to resend verification code");
      }
    }
  };

  return (
    <div className="bg-background flex flex-col w-full min-h-screen">
      {/* StatusBar and Header - fixed at top */}
      <div className="bg-card shadow-md">
        <StatusBar />
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between p-4 border-b bg-card"
        >
          <div className="flex items-center">
            <Link to={ROUTES.SIGNUP}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
            </Link>
            <h1 className="text-xl font-bold ml-2">Verify OTP</h1>
          </div>
        </motion.div>
      </div>

      {/* Centered content container */}
      <div className="flex-grow flex flex-col justify-center items-center p-6 -mt-8 md:-mt-16">
        {/* Logo and instruction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center mb-8"
        >
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-36 h-36 object-cover mb-4"
            alt="Logo"
            src="/logo.png"
          />
          <h2 className="text-2xl font-bold mb-1">Verification Code</h2>
          <p className="text-xs text-muted-foreground text-center">
            {email
              ? `We sent a code to ${email}`
              : "Please check your email for the verification code"}
          </p>
        </motion.div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3 mb-2">
              {otp.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-14 h-14 border border-gray-200 rounded-lg flex items-center justify-center bg-card shadow-sm"
                >
                  <input
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-full h-full text-center text-2xl font-semibold border-none focus:outline-none focus:ring-0"
                    autoFocus={index === 0}
                  />
                </motion.div>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-center text-red-500 text-sm">{error}</p>
            )}

            {/* Timer and Resend */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isTimerActive}
                className={`text-sm font-medium ${
                  isTimerActive
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-blue-500 cursor-pointer"
                }`}
              >
                {isTimerActive ? `Resend Code (${timer}s)` : "Resend Code"}
              </button>
            </div>

            {/* Verify Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="w-full py-3 bg-primary rounded-full text-white font-medium hover:bg-blue-600 transition-colors"
                disabled={otp.join("").length !== 4 || isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendOtp;
