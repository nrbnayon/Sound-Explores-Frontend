// hooks/useNativeShare.js
import { useState } from "react";
import toast from "react-hot-toast";

export const useNativeShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  // Check if Web Share API is supported
  const canShare = () => {
    return navigator.share !== undefined;
  };

  // Native share function
  const shareNatively = async (shareData) => {
    // console.log("Attempting to share natively:", shareData);
    if (!canShare()) {
      throw new Error("Web Share API not supported");
    }

    try {
      setIsSharing(true);
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if (error.name === "AbortError") {
        // User cancelled the share
        return false;
      }
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  // Fallback share options for unsupported browsers
  const fallbackShare = (shareData) => {
    const { title, text, url } = shareData;

    // Use the complete formatted message (text) for all platforms
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}&summary=${encodeURIComponent(text)}`,
      messenger: `fb-messenger://share/?link=${encodeURIComponent(
        url
      )}&app_id=YOUR_APP_ID`,
      sms: `sms:?body=${encodeURIComponent(text)}`,
      email: `mailto:?subject=${encodeURIComponent(
        title
      )}&body=${encodeURIComponent(text)}`,
    };

    return shareUrls;
  };

  // Copy to clipboard fallback
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard!");
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (copied) {
          toast.success("Link copied to clipboard!");
          return true;
        } else {
          throw new Error("Copy failed");
        }
      }
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      return false;
    }
  };

  // Main share function that handles both native and fallback
  const share = async (shareData, options = {}) => {
    const { forceNative = false, showFallbackModal = true } = options;

    if (canShare() && !forceNative) {
      try {
        const shared = await shareNatively(shareData);
        if (shared) {
          //   toast.success("Shared successfully!");
          return { success: true, method: "native" };
        } else {
          return { success: false, method: "native", reason: "cancelled" };
        }
      } catch (error) {
        console.error("Native share failed:", error);
        toast.error("Share failed, showing alternatives...");
      }
    }

    // Return fallback options
    if (showFallbackModal) {
      const fallbackUrls = fallbackShare(shareData);
      return {
        success: false,
        method: "fallback",
        shareUrls: fallbackUrls,
        shareData,
      };
    }

    return { success: false, method: "none" };
  };

  return {
    share,
    canShare: canShare(),
    isSharing,
    copyToClipboard,
    fallbackShare,
  };
};
