import React, { useState, useEffect } from "react";

export const StatusBar = () => {
  const [timeString, setTimeString] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
  const [batteryLevel, setBatteryLevel] = useState(75); // Default fallback value
  const [isCharging, setIsCharging] = useState(false);
  const [networkStatus, setNetworkStatus] = useState("wifi"); // Default to wifi for demo

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      );
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Battery Status API
  useEffect(() => {
    const getBatteryInfo = async () => {
      try {
        if ("getBattery" in navigator) {
          const battery = await navigator.getBattery();

          // Update initial values
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          // Listen for changes
          const handleLevelChange = () =>
            setBatteryLevel(Math.round(battery.level * 100));
          const handleChargingChange = () => setIsCharging(battery.charging);

          battery.addEventListener("levelchange", handleLevelChange);
          battery.addEventListener("chargingchange", handleChargingChange);

          return () => {
            battery.removeEventListener("levelchange", handleLevelChange);
            battery.removeEventListener("chargingchange", handleChargingChange);
          };
        }
      } catch (error) {
        console.log("Battery API not available:", error);
      }
    };

    getBatteryInfo();
  }, []);

  // Network Status API - Enhanced implementation
  useEffect(() => {
    const updateNetworkStatus = () => {
      // First try the modern Network Information API
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection) {
        // Map connection types to our simplified categories
        const type = connection.type;
        if (type === "wifi") {
          setNetworkStatus("wifi");
        } else if (["cellular", "2g", "3g", "4g", "5g"].includes(type)) {
          setNetworkStatus("cellular");
        } else if (type === "none") {
          setNetworkStatus("none");
        } else {
          // Fallback detection method using navigator.onLine
          setNetworkStatus(navigator.onLine ? "wifi" : "none");
        }
      } else {
        // If Connection API not available, use navigator.onLine as fallback
        setNetworkStatus(navigator.onLine ? "wifi" : "none");
      }
    };

    // Initial status update
    updateNetworkStatus();

    // Listen for online/offline events as a reliable fallback
    window.addEventListener("online", () => setNetworkStatus("wifi"));
    window.addEventListener("offline", () => setNetworkStatus("none"));

    // Listen for connection changes if API is available
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      connection.addEventListener("change", updateNetworkStatus);
    }

    return () => {
      window.removeEventListener("online", () => setNetworkStatus("wifi"));
      window.removeEventListener("offline", () => setNetworkStatus("none"));

      if (connection) {
        connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  // Battery icon with accessibility
  const getBatteryIcon = () => {
    const fillColor =
      batteryLevel <= 20
        ? "text-red-500"
        : batteryLevel <= 50
        ? "text-orange-500"
        : "text-green-500";

    const fillWidth = Math.round((batteryLevel / 100) * 12);

    return (
      <div
        className='relative flex items-center'
        aria-label={`Battery at ${batteryLevel}%${
          isCharging ? ", charging" : ""
        }`}
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          className='text-white'
        >
          <rect x='2' y='7' width='16' height='10' rx='2' ry='2' />
          <path d='M20 10v4' />
          {/* Battery fill */}
          <rect
            x='4'
            y='9'
            width={fillWidth}
            height='6'
            className={fillColor}
            fill='currentColor'
          />
          {/* Charging indicator */}
          {isCharging && (
            <path
              d='M7 12 h6 m-3 -3 v6'
              stroke='white'
              strokeWidth='1'
              className='animate-pulse'
            />
          )}
        </svg>
        <span className='ml-1 text-xs'>{batteryLevel}%</span>
      </div>
    );
  };

  // Network icon with accessibility - FIXED IMPLEMENTATION
  const getNetworkIcon = () => {
    if (networkStatus === "wifi") {
      return (
        <div className='flex items-center' aria-label='Wi-Fi connected'>
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='text-white'
          >
            {/* WiFi waves, from outer to inner */}
            <path d='M1.42 9a16 16 0 0 1 21.16 0' />
            <path d='M5 12.55a11 11 0 0 1 14.08 0' />
            <path d='M8.53 16.11a6 6 0 0 1 6.95 0' />
            <circle cx='12' cy='20' r='1' fill='currentColor' />
          </svg>
        </div>
      );
    } else if (networkStatus === "cellular") {
      return (
        <div
          className='flex items-center'
          aria-label='Cellular network connected'
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='text-white'
          >
            <rect x='2' y='20' width='4' height='4' />
            <rect x='8' y='16' width='4' height='8' />
            <rect x='14' y='12' width='4' height='12' />
            <rect x='20' y='8' width='4' height='16' />
          </svg>
        </div>
      );
    } else {
      return (
        <div className='flex items-center' aria-label='No network connection'>
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='text-white'
          >
            <path d='M1.42 9a16 16 0 0 1 21.16 0' />
            <path d='M5 12.55a11 11 0 0 1 14.08 0' />
            <path d='M8.53 16.11a6 6 0 0 1 6.95 0' />
            <circle cx='12' cy='20' r='1' fill='currentColor' />
            {/* Red diagonal line indicating disconnection */}
            <line x1='1' y1='1' x2='23' y2='23' stroke='red' strokeWidth='2' />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className='h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex justify-between items-center px-4 shadow-lg rounded-b-lg'>
      <span className='font-semibold text-sm tracking-wide'>{timeString}</span>
      <div className='flex space-x-4 items-center'>
        <div className='hover:scale-110 transition-transform duration-200'>
          {getNetworkIcon()}
        </div>
        <div className='hover:scale-110 transition-transform duration-200'>
          {getBatteryIcon()}
        </div>
      </div>
    </div>
  );
};
