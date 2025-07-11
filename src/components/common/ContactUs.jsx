import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import {
  Mail,
  CheckCircle,
  Send,
  Loader2,
  Clock,
  HelpCircle,
} from "lucide-react";
import Header from "./Header";
import { removeAuthTokens } from "../../utils/cookie-utils";

const ContactUs = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Clear all cookies manually
  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      // Clear cookie for current domain
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    });

    // Also clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleLogout = () => {
    removeAuthTokens();
    clearAllCookies();
    setShowLogoutModal(false);
    window.location.href = "/";
  };

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("37afkPFBFnK21dm4d"); // EmailJS public key
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value || "",
    }));

    // Clear previous error
    setPhoneError("");

    // Validate phone number if value exists
    if (value && value.length > 0) {
      try {
        if (!isValidPhoneNumber(value)) {
          setPhoneError("Please enter a valid phone number");
        }
      } catch (error) {
        setPhoneError("Please enter a valid phone number");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number if provided
    if (formData.phone && formData.phone.length > 0) {
      try {
        if (!isValidPhoneNumber(formData.phone)) {
          setPhoneError("Please enter a valid phone number");
          return;
        }
      } catch (error) {
        setPhoneError("Please enter a valid phone number");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "Not provided",
        title: formData.subject,
        message: formData.message,
        time: new Date().toLocaleString(),
        subject: `Contact: ${formData.subject} - From ${formData.name}`,
        reply_to: formData.email,
      };

      await emailjs.send(
        "poop-alert", // Your actual service ID
        "template_yrq0cap", //EmailJS template ID
        templateParams
      );

      toast.success("Message sent successfully! We'll get back to you soon.", {
        duration: 5000,
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setPhoneError("");
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error(
        "Failed to send message. Please try again or contact us directly.",
        {
          duration: 5000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <style jsx>{`
        .phone-input-container .PhoneInputInput {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          background-color: hsl(var(--background));
          border: 1px solid hsl(var(--input));
          border-radius: 8px;
          color: hsl(var(--foreground));
          transition: border-color 0.2s;
        }

        .phone-input-container .PhoneInputInput:focus {
          outline: none;
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }

        .phone-input-container .PhoneInputInput::placeholder {
          color: hsl(var(--muted-foreground));
        }

        .phone-input-container .PhoneInputCountrySelect {
          background-color: hsl(var(--background));
          border: 1px solid hsl(var(--input));
          border-radius: 8px;
          color: hsl(var(--foreground));
          margin-right: 8px;
          padding: 8px;
          height: auto;
          min-height: auto;
        }

        .phone-input-container .PhoneInputCountrySelect:focus {
          outline: none;
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }

        .phone-input-container .PhoneInputCountrySelectArrow {
          color: hsl(var(--muted-foreground));
        }

        .phone-input-container .PhoneInputCountryIcon {
          width: 20px;
          height: 15px;
        }

        .phone-input-container .PhoneInput {
          display: flex;
          align-items: center;
        }

        .phone-input-container .PhoneInputCountry {
          display: flex;
          align-items: center;
          margin-right: 8px;
        }
      `}</style>
      <Helmet>
        <title>Contact Us - Poop Alert Sound Library | Get in Touch</title>
        <meta
          name="description"
          content="Contact Poop Alert Sound Library for support, feedback, or inquiries. We're here to help with all your sound alert needs."
        />
        <meta
          name="keywords"
          content="poop alert, sound library, contact, support, feedback, help"
        />
        <meta name="author" content="Poop Alert Sound Library" />
        <meta
          property="og:title"
          content="Contact Us - Poop Alert Sound Library"
        />
        <meta
          property="og:description"
          content="Get in touch with Poop Alert Sound Library for support and inquiries."
        />
        <meta property="og:url" content="https://www.poop-alert.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Poop Alert Sound Library" />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Contact Us - Poop Alert Sound Library"
        />
        <meta
          name="twitter:description"
          content="Get in touch with Poop Alert Sound Library for support and inquiries."
        />
        <link rel="canonical" href="https://www.poop-alert.com/contact" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <Header backHref="/profile" title="" onLogoutClick={toggleLogoutModal} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-6 py-5">
        <div className="w-full mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-6 sm:mb-6 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold mb-4 text-foreground">
              Contact Us
            </h1>
            <p className="text-base sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions about our sound library? Need support? Want to
              share feedback? We'd love to hear from you! Get in touch and we'll
              respond as soon as possible.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="space-y-6 sm:space-y-8 order-2 lg:order-none"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">
                  Get in touch
                </h2>

                <div className="space-y-4">
                  <motion.div
                    className="flex items-start space-x-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">Email</h3>
                      <p className="text-muted-foreground text-sm break-all">
                        poopalert.email@gmail.com
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">
                        Response Time
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Usually within 24 hours
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">Support</h3>
                      <p className="text-muted-foreground text-sm">
                        Free support for all users
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm order-1 lg:order-none"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-foreground">
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-3 text-base bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 text-foreground"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-3 text-base bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 text-foreground"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="phone-input-container">
                    <PhoneInput
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      defaultCountry="US"
                      className="w-full phone-input-custom"
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-2 text-sm text-red-600">{phoneError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-3 text-base bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 text-foreground"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Request For Sound">Request For Sound</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3 text-base bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 text-foreground resize-vertical min-h-[120px]"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="space-y-6 sm:space-y-8 order-2 lg:order-none"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center ">
                  <HelpCircle className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      How do I download sounds?
                    </p>
                    <p className="text-muted-foreground">
                      Browse our library and click the download button next to
                      any sound.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Are the sounds free to use?
                    </p>
                    <p className="text-muted-foreground">
                      Yes, some sounds in our library are free for personal and
                      commercial use.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Can I request custom sounds?
                    </p>
                    <p className="text-muted-foreground">
                      Contact us with your requirements and we'll see what we
                      can do.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
            onClick={toggleLogoutModal}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card w-full max-w-md rounded-t-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-gray-300 rounded-full my-3"></div>
                <div className="w-full p-6">
                  <h3 className="text-2xl font-bold text-red-600 text-center mb-6">
                    Logout
                  </h3>
                  <div className="border-t border-gray-200 mb-6"></div>
                  <p className="text-lg text-center mb-8 text-gray-600">
                    Are you sure you want to log out?
                  </p>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleLogoutModal}
                      className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl text-black font-semibold transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="flex-1 py-4 px-6 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-colors"
                    >
                      Yes, Logout
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;
