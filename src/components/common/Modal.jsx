import React, { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

/**
 * Universal Modal Primitive — Standard Design System Component
 * Automatically coordinates entrance & exit animations, Escape key handling,
 * and stroke-free/shadow-free Phantom wallet styling.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 520,
  showCloseButton = true,
  className = '',
}) {
  const { shouldRender, isClosing } = useModalAnimation(isOpen, 240);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? 'is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-dialog-title' : undefined}
    >
      <div
        className={`modal-card ${isClosing ? 'is-closing' : ''} ${className}`}
        style={{ maxWidth: `${maxWidth}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Standard Modal Header */}
        {(title || showCloseButton) && (
          <div className="modal-header-row">
            <div>
              {title && (
                <h3 id="modal-dialog-title" className="modal-title">
                  {title}
                </h3>
              )}
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="btn-icon"
                aria-label="Close dialog"
              >
                <IconX size={18} stroke={1.8} />
              </button>
            )}
          </div>
        )}

        {/* Modal Body Content */}
        <div className="modal-body-content">{children}</div>
      </div>
    </div>
  );
}
