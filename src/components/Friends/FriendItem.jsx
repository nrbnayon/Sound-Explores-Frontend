// src\components\Friends\FriendItem.jsx
import { useState, useRef, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const useSwipe = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum distance required for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };

  // Mouse event handlers for desktop testing
  const [mouseStart, setMouseStart] = useState(null);
  const [mouseDown, setMouseDown] = useState(false);

  const onMouseDown = (e) => {
    setMouseDown(true);
    setMouseStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (!mouseDown) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!mouseDown || !mouseStart || !touchEnd) {
      setMouseDown(false);
      return;
    }
    
    const distance = mouseStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
    
    setMouseDown(false);
  };

  // Clean up mouse events if component unmounts while mouse is down
  useEffect(() => {
    if (mouseDown) {
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('mousemove', onMouseMove);
    }
    
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [mouseDown, mouseStart, touchEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
  };
};

// Friend Item Component with Custom Swipe Support
export const FriendItem = ({ friend, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const swipeHandlers = useSwipe(
    () => setIsOpen(true),   // onSwipeLeft
    () => setIsOpen(false)   // onSwipeRight
  );

  return (
    <div className='relative h-16 overflow-hidden'>
      <div
        {...swipeHandlers}
        className='flex items-center justify-between py-3 touch-pan-y'
        style={{
          transform: isOpen ? "translateX(-10px)" : "translateX(0)",
          transition: "transform 0.3s ease-out",
        }}
      >
        <div className='flex items-center ml-1'>
          <img
            src={friend.image || "/api/placeholder/48/48"}
            alt={friend.name}
            className='w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100'
          />
          <span className='ml-3 font-medium'>{friend.name}</span>
        </div>

        <Link
          to='/chat-interface'
          className='flex items-right justify-center cursor-pointer'
          style={{ width: "80px" }}
        >
          <Mail size={20} />
        </Link>
      </div>

      <div
        {...swipeHandlers}
        className='flex items-center justify-between py-3 touch-pan-y'
        style={{
          transform: isOpen ? "translateX(260px)" : "translateX(1000px)",
          transition: "transform 0.3s ease-in",
        }}
      >
        <button
          className='bg-red-500 absolute top-[-55px] text-white h-10 w-20 mx-1 rounded'
          onClick={() => {
            onRemove(friend.id);
            setIsOpen(false);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};