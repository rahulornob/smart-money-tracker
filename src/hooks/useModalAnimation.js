import { useState, useEffect } from 'react';

/**
 * Hook to coordinate entrance and exit animations before unmounting.
 * @param {boolean} isOpen - Current open state
 * @param {number} duration - Exit animation duration in milliseconds
 * @returns {{ shouldRender: boolean, isClosing: boolean }}
 */
export function useModalAnimation(isOpen, duration = 240) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, shouldRender]);

  return { shouldRender, isClosing };
}

export default useModalAnimation;
