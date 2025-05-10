import { useState } from "react";
import { CreditCard } from "lucide-react";
import { StatusBar } from "../../../components/common/StatusBar";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import Header from "../../../components/common/Header";
import { useAuth } from "../../../contexts/AuthContext";

const Payment = () => {
  const [formData, setFormData] = useState({
    cardHolderName: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, signOut } = useAuth();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Format card number
  const formatCardNumber = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    const formatted = input.substring(0, 16);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // Format expiration date as MM/YY
  const formatExpirationDate = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 0) {
      const month = input.substring(0, 2);
      const year = input.substring(2, 4);
      if (input.length <= 2) {
        setFormData((prev) => ({ ...prev, expirationDate: month }));
      } else {
        setFormData((prev) => ({
          ...prev,
          expirationDate: `${month}/${year}`,
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, expirationDate: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = "Card holder name is required";
    }
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^[0-9]{16}$/.test(formData.cardNumber)) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!formData.expirationDate.trim()) {
      newErrors.expirationDate = "Expiration date is required";
    } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.expirationDate)) {
      newErrors.expirationDate = "Expiration date must be in MM/YY format";
    }
    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^[0-9]{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        console.log("Payment data:", formData);
        toast.success("Payment information updated");
      } catch (error) {
        toast.error("Failed to update payment information");
      }
    }
  };

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

    const handleLogout = () => {
      signOut();
      setShowLogoutModal(false);
    };

  return (
    <div className='bg-background flex flex-row justify-center w-full min-h-screen'>
      <div className='bg-card w-full max-w-md relative shadow-md'>
        <StatusBar />
        <Header
          backHref='/profile'
          title='Payment Method'
          onLogoutClick={toggleLogoutModal}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='flex items-center justify-center mt-6 mb-4'
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className='relative w-[300px] h-[180px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg overflow-hidden'
          >
            <div className='absolute top-4 left-4 right-4 flex justify-between items-center'>
              <CreditCard className='text-white w-6 h-6' />
              <div className='text-white font-bold text-lg'>PREMIUM</div>
            </div>
            <div className='absolute bottom-4 left-4'>
              <div className='text-gray-200 text-xs mb-1'>CARD HOLDER</div>
              <div className='text-white font-medium'>
                {formData.cardHolderName || "YOUR NAME"}
              </div>
            </div>
            <div className='absolute bottom-4 right-4'>
              <div className='text-gray-200 text-xs mb-1'>EXPIRES</div>
              <div className='text-white font-medium'>
                {formData.expirationDate || "MM/YY"}
              </div>
            </div>
            <div className='absolute top-1/2 left-4 transform -translate-y-1/2'>
              <div className='text-white font-mono text-xl'>
                {formData.cardNumber
                  ? `•••• •••• •••• ${formData.cardNumber.slice(-4)}`
                  : "•••• •••• •••• ••••"}
              </div>
            </div>
          </motion.div>
        </motion.div>
        <form onSubmit={handleSubmit} className='p-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className='space-y-4'
          >
            <div>
              <label className='block text-base font-medium mb-1'>
                Card Holder
              </label>
              <input
                type='text'
                name='cardHolderName'
                value={formData.cardHolderName}
                onChange={handleChange}
                placeholder='Card Holder Name'
                className={`w-full p-3 border ${
                  errors.cardHolderName ? "border-red-500" : "border-gray-200"
                } rounded-lg`}
              />
              {errors.cardHolderName && (
                <span className='text-destructive text-sm mt-1 block'>
                  {errors.cardHolderName}
                </span>
              )}
            </div>
            <div>
              <label className='block text-base font-medium mb-1'>
                Card Number
              </label>
              <input
                type='text'
                name='cardNumber'
                value={formData.cardNumber}
                onChange={(e) => {
                  handleChange(e);
                  formatCardNumber(e);
                }}
                placeholder='XXXX XXXX XXXX XXXX'
                maxLength={16}
                className={`w-full p-3 border ${
                  errors.cardNumber ? "border-red-500" : "border-gray-200"
                } rounded-lg`}
              />
              {errors.cardNumber && (
                <span className='text-destructive text-sm mt-1 block'>
                  {errors.cardNumber}
                </span>
              )}
            </div>
            <div className='flex space-x-4'>
              <div className='w-1/2'>
                <label className='block text-base font-medium mb-1'>
                  MM/YY
                </label>
                <input
                  type='text'
                  name='expirationDate'
                  value={formData.expirationDate}
                  onChange={(e) => {
                    handleChange(e);
                    formatExpirationDate(e);
                  }}
                  placeholder='MM/YY'
                  maxLength={5}
                  className={`w-full p-3 border ${
                    errors.expirationDate ? "border-red-500" : "border-gray-200"
                  } rounded-lg`}
                />
                {errors.expirationDate && (
                  <span className='text-destructive text-sm mt-1 block'>
                    {errors.expirationDate}
                  </span>
                )}
              </div>
              <div className='w-1/2'>
                <label className='block text-base font-medium mb-1'>CVV</label>
                <input
                  type='text'
                  name='cvv'
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder='CVV'
                  maxLength={4}
                  className={`w-full p-3 border ${
                    errors.cvv ? "border-red-500" : "border-gray-200"
                  } rounded-lg`}
                />
                {errors.cvv && (
                  <span className='text-destructive text-sm mt-1 block'>
                    {errors.cvv}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            className='w-full mt-6 py-3 px-4 bg-primary text-white rounded-full font-medium shadow-md hover:bg-blue-600 transition-colors'
          >
            Update Payment Method
          </motion.button>
        </form>
        {/* Logout Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50'
              onClick={toggleLogoutModal}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className='bg-card w-full max-w-md rounded-t-2xl'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='flex flex-col items-center'>
                  <div className='w-12 h-1 bg-gray-300 rounded-full my-3'></div>
                  <div className='w-full p-6'>
                    <h3 className='text-2xl font-bold text-destructive text-center mb-6'>
                      Logout
                    </h3>
                    <div className='border-t border-gray-200 mb-6'></div>
                    <p className='text-xl text-center mb-8'>
                      Are you sure you want to log out?
                    </p>
                    <div className='flex gap-4'>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLogoutModal}
                        className='flex-1 py-4 px-6 bg-gray-100 rounded-full text-black font-medium'
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className='flex-1 py-4 px-6 bg-red-500 rounded-full text-white font-medium'
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
    </div>
  );
};

export default Payment;
