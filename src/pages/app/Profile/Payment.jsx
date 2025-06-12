// src/pages/app/Profile/Payment.jsx
import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Star,
  Zap,
  Crown,
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldX,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Header from "../../../components/common/Header";
import { useAuth } from "../../../contexts/AuthContext";
import { subscriptionService } from "../../../hooks/useSubscription";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
    complete: {
      color: "#059669",
      iconColor: "#059669",
    },
  },
  hidePostalCode: true,
};

const PaymentForm = ({ subscriptionStatus, onSubscriptionUpdate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !cardHolderName.trim()) {
      toast.error("Please enter cardholder name and ensure Stripe is loaded.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    setIsLoading(true);

    try {
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: cardHolderName,
            email: user?.email,
          },
        });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      const response = await subscriptionService.buySubscription(
        "premium",
        4.99,
        paymentMethod.id
      );
      const { data } = response;

      if (data.clientSecret) {
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: paymentMethod.id,
          });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent.status === "succeeded") {
          toast.success("Payment successful! Subscription activated.");
          setTimeout(() => onSubscriptionUpdate(), 2000);
        } else if (paymentIntent.status === "requires_action") {
          toast.warning(
            "Payment requires additional authentication. Please complete the process."
          );
        } else {
          toast.error(
            `Payment status: ${paymentIntent.status}. Please try again.`
          );
        }
      } else if (data.status === "active") {
        toast.success("Subscription activated successfully!");
        setTimeout(() => onSubscriptionUpdate(), 1000);
      } else if (data.status === "incomplete") {
        toast.info("Processing payment... Please wait.");
        setTimeout(async () => {
          try {
            await subscriptionService.syncSubscriptionStatus();
            onSubscriptionUpdate();
            toast.success("Subscription status updated.");
          } catch (error) {
            toast.error(
              "Payment may be pending. Please check your subscription status."
            );
          }
        }, 3000);
      } else {
        toast.error(
          "Subscription created but status is unclear. Please check your account."
        );
        setTimeout(() => onSubscriptionUpdate(), 2000);
      }

      setCardHolderName("");
      cardElement.clear();
      setCardError("");
    } catch (error) {
      toast.error(error.message || "Failed to process subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : "");
    setCardComplete(event.complete);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-background rounded-3xl shadow-lg border border-gray-100"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700">
            Cardholder Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-0 transition-all duration-200 font-medium"
              required
            />
            {cardHolderName && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/3 transform -translate-y-1/2"
              >
                <CheckCircle className="w-5 h-5 text-indigo-500" />
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Card Details <Shield className="w-4 h-4 text-indigo-500" />
          </label>
          <div className="relative">
            <div
              className={`w-full px-4 py-3.5 border-2 bg-background rounded-xl transition-all duration-200 ${
                cardError
                  ? "border-red-300 focus-within:border-red-500"
                  : cardComplete
                  ? "border-indigo-300 focus-within:border-indigo-500"
                  : "border-gray-200 focus-within:border-indigo-500"
              }`}
            >
              <CardElement
                options={cardElementOptions}
                onChange={handleCardChange}
              />
            </div>
            {cardComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/3 transform -translate-y-1/2"
              >
                <CheckCircle className="w-5 h-5 text-indigo-500" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {cardError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200"
              >
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cardError}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg"
        >
          <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <p className="text-sm text-indigo-800">
            Your payment information is encrypted and secure. We never store
            your card details.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={
            !stripe ||
            isLoading ||
            subscriptionStatus?.isSubscribed ||
            !cardHolderName.trim()
          }
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                <span>Subscribe to Premium - $4.99/month</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </div>
        </motion.button>

        <AnimatePresence>
          {subscriptionStatus?.subscription?.status === "incomplete" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="p-1 bg-yellow-100 rounded-full">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    Payment Incomplete
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Your subscription is pending payment confirmation. Please
                    complete the payment to activate your subscription.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {subscriptionStatus?.subscription?.status === "active" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800">
                  Your subscription is active and ready to use!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

const SubscriptionStatusCard = ({ subscriptionStatus, onRefresh }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!subscriptionStatus || !subscriptionStatus.isSubscribed) return null;

  // Helper function to parse MongoDB dates
  const parseDate = (dateValue) => {
    if (!dateValue) return null;

    // Handle MongoDB date format: { "$date": "2025-07-11T07:05:51.000Z" }
    if (typeof dateValue === "object" && dateValue.$date) {
      return new Date(dateValue.$date);
    }

    // Handle regular date strings or Date objects
    return new Date(dateValue);
  };

  const formatDate = (dateValue) => {
    const date = parseDate(dateValue);
    return date && !isNaN(date) ? date.toLocaleDateString() : "Invalid Date";
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: "text-green-600",
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
          borderColor: "border-green-100",
          textColor: "text-green-800",
        };
      case "cancelled":
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: "text-red-600",
          bgColor: "bg-gradient-to-r from-red-50 to-pink-50",
          borderColor: "border-red-100",
          textColor: "text-red-800",
        };
      case "incomplete":
        return {
          icon: <Clock className="w-5 h-5" />,
          color: "text-yellow-600",
          bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
          borderColor: "border-yellow-100",
          textColor: "text-yellow-800",
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          color: "text-gray-600",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          borderColor: "border-gray-100",
          textColor: "text-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(
    subscriptionStatus.subscription?.status || "inactive"
  );

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    try {
      await subscriptionService.syncSubscriptionStatus();
      toast.success("Subscription status synchronized.");
      setTimeout(() => onRefresh(), 1000);
    } catch (error) {
      toast.error("Failed to sync subscription status.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`mx-6 mb-6 p-6 rounded-3xl border ${statusConfig.bgColor} ${statusConfig.borderColor} shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full shadow-sm ${statusConfig.color}`}>
            {statusConfig.icon}
          </div>
          <h3 className={`font-bold text-xl ${statusConfig.textColor}`}>
            Subscription Status
          </h3>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            disabled={isSyncing}
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            Refresh
          </motion.button>
          {subscriptionStatus.subscription?.status === "incomplete" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSyncStatus}
              disabled={isSyncing}
              className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 transition-colors"
            >
              {isSyncing ? "Syncing..." : "Sync Status"}
            </motion.button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-600">Plan:</span>
            <div className={`font-bold text-lg ${statusConfig.color}`}>
              {subscriptionStatus.subscription?.plan?.toUpperCase() || "FREE"}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span>
            <div className={`font-semibold ${statusConfig.color}`}>
              {subscriptionStatus.subscription?.status?.toUpperCase() ||
                "INACTIVE"}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-600">Auto Renew:</span>
            <div className={`font-semibold ${statusConfig.color}`}>
              {subscriptionStatus.subscription?.autoRenew ? "YES" : "NO"}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-600">Subscribed:</span>
            <div
              className={`font-semibold ${
                subscriptionStatus.isSubscribed
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {subscriptionStatus.isSubscribed ? "Yes" : "No"}
            </div>
          </div>
          {subscriptionStatus.subscription?.price && (
            <div>
              <span className="font-medium text-gray-600">Price:</span>
              <div className="font-semibold text-gray-800">
                ${subscriptionStatus.subscription.price}/month
              </div>
            </div>
          )}
          {subscriptionStatus.subscription && (
            <div>
              <span className="font-medium text-gray-600">End Date:</span>
              <div className="font-semibold text-gray-800">
                {formatDate(subscriptionStatus.subscription.endDate)}
              </div>
            </div>
          )}
        </div>
      </div>

      {subscriptionStatus.subscription && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between">
            <div>
              <span className="font-medium text-gray-600">Start Date:</span>
              <div className="font-semibold text-gray-800">
                {formatDate(subscriptionStatus.subscription.startDate)}
              </div>
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-600">
                {subscriptionStatus.subscription?.cancelAtPeriodEnd
                  ? "Ends on:"
                  : "Renews on:"}
              </span>
              <div className="font-semibold text-gray-800">
                {formatDate(subscriptionStatus.subscription.endDate)}
              </div>
            </div>
          </div>
        </div>
      )}

      {subscriptionStatus.subscription?.status === "incomplete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-xl"
        >
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">
                Action Required
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                Your subscription payment is incomplete. Please complete the
                payment or try subscribing again with a different payment
                method.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const PremiumCard = ({ user, subscriptionStatus }) => {
  const currentDate = new Date();
  const expiryDate = subscriptionStatus?.subscription?.currentPeriodEnd
    ? new Date(subscriptionStatus.subscription.currentPeriodEnd)
    : currentDate;
  const expiryMonthYear = `${String(expiryDate.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(expiryDate.getFullYear()).slice(-2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-center mt-6 mb-6 px-6"
    >
      <motion.div
        whileHover={{ scale: 1.03, rotateY: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[340px] h-[200px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 20px 40px rgba(102, 126, 234, 0.4)",
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-16 h-16 border border-white rounded-full animate-pulse" />
          <div className="absolute top-8 right-8 w-8 h-8 border border-white rounded-full animate-ping" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border border-white rounded-full animate-pulse delay-300" />
        </div>

        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="text-white w-6 h-6" />
            <span className="text-white font-semibold text-sm tracking-wide">
              PREMIUM CARD
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Crown className="text-yellow-300 w-5 h-5" />
            <span className="text-white font-bold text-lg">
              {subscriptionStatus?.isSubscribed ? "PREMIUM" : "FREE"}
            </span>
          </div>
        </div>

        <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
          <div className="text-white font-mono text-xl tracking-wider">
            {subscriptionStatus?.isSubscribed
              ? "•••• •••• •••• ACTIVE"
              : "•••• •••• •••• INACTIVE"}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <div className="text-white/70 text-xs uppercase tracking-wide mb-1">
              Card Holder
            </div>
            <div className="text-white font-semibold truncate max-w-[150px]">
              {user?.name?.toUpperCase() ||
                user?.email?.toUpperCase() ||
                "YOUR NAME"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-xs uppercase tracking-wide mb-1">
              Expires
            </div>
            <div className="text-white font-bold">MM/YY</div>
          </div>
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12"
          animate={{ x: [-100, 400] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      </motion.div>
    </motion.div>
  );
};

const PremiumFeatures = ({ subscriptionStatus }) => {
  if (subscriptionStatus?.isSubscribed) return null;

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Unlimited access to all sound",
    },
    {
      icon: <Star className="w-5 h-5" />,
      text: "Play and download all sounds",
    },
    { icon: <ShieldX className="w-5 h-5" />, text: "Cancel anytime" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mx-6 mb-6 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border border-indigo-100 shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">
              Premium Subscription
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Unlock the full potential of our platform
          </p>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <div className="p-1 bg-indigo-100 rounded-full text-indigo-600">
                  {feature.icon}
                </div>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-indigo-600">$4.99</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Billed monthly</div>
        </div>
      </div>
    </motion.div>
  );
};

const Payment = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
      toast.error(error.message || "Failed to fetch subscription status.");
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setIsLoading(true);
    try {
      await subscriptionService.cancelSubscription();
      toast.success("Subscription cancelled successfully.");
      // Sync status after cancellation
      setTimeout(async () => {
        try {
          await subscriptionService.syncSubscriptionStatus();
          await fetchSubscriptionStatus();
        } catch (error) {
          toast.error("Failed to sync subscription status after cancellation.");
        }
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Failed to cancel subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLogoutModal = () => setShowLogoutModal(!showLogoutModal);
  const handleLogout = () => {
    signOut();
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-md mx-auto shadow-xl relative min-h-screen bg-background rounded-3xl overflow-hidden">
        <Header
          backHref="/profile"
          title="Payment Method"
          onLogoutClick={toggleLogoutModal}
        />

        <PremiumCard user={user} subscriptionStatus={subscriptionStatus} />

        <SubscriptionStatusCard
          subscriptionStatus={subscriptionStatus}
          onRefresh={fetchSubscriptionStatus}
        />

        <PremiumFeatures subscriptionStatus={subscriptionStatus} />

        {!subscriptionStatus?.isSubscribed ? (
          <Elements stripe={stripePromise}>
            <PaymentForm
              subscriptionStatus={subscriptionStatus}
              onSubscriptionUpdate={fetchSubscriptionStatus}
            />
          </Elements>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Cancel Subscription</span>
                  </>
                )}
              </div>
            </motion.button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Your subscription will remain active until the end of your current
              billing period.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
              onClick={toggleLogoutModal}
            >
              <motion.div
                initial={{ y: 400, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 400, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-full max-w-md bg-background rounded-t-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full my-4"></div>

                  <div className="w-full p-6 pb-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-red-100 rounded-full">
                        <LogOut className="w-8 h-8 text-red-600" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                      Sign Out
                    </h3>

                    <p className="text-gray-600 text-center mb-8">
                      Are you sure you want to sign out of your account?
                    </p>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={toggleLogoutModal}
                        className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg"
                      >
                        Sign Out
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
