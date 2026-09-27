import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/60 backdrop-blur-xs animate-fade-in">
      <div
        className={clsx(
          "w-full bg-white border border-[#475569] rounded-[14px] shadow-xl overflow-hidden text-[#0F172A] transform transition-all",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="px-6 py-4 border-b border-[#94A3B8] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              {title && <h2 className="text-lg font-bold text-[#0F172A]">{title}</h2>}
              {description && <p className="text-xs text-[#334155] font-medium mt-0.5">{description}</p>}
            </div>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="text-[#334155] hover:text-[#0F172A] transition-colors p-1 rounded-lg hover:bg-[#E2E8F0]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const ModalHeader = ({ title, description, children }) => (
  <div className="pb-3 mb-3 border-b border-[#94A3B8]">
    {title && <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>}
    {description && <p className="text-xs text-[#334155] font-medium mt-0.5">{description}</p>}
    {children}
  </div>
);

export const ModalBody = ({ children, className }) => (
  <div className={clsx("space-y-4 text-[#0F172A]", className)}>{children}</div>
);

export const ModalFooter = ({ children, className }) => (
  <div className={clsx("pt-4 mt-4 border-t border-[#94A3B8] flex items-center justify-end gap-3", className)}>
    {children}
  </div>
);

export default Modal;
