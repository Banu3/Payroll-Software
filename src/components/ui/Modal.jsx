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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#12201A]/40 backdrop-blur-xs animate-fade-in">
      <div
        className={clsx(
          "w-full bg-white border border-[#CBD8D1] rounded-[16px] shadow-[0_12px_32px_rgba(20,50,35,0.14)] overflow-hidden text-[#12201A] transform transition-all max-h-[92vh] flex flex-col",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="px-5 py-4 border-b border-[#E1E9E4] flex items-center justify-between bg-[#F3F7F5] shrink-0">
            <div>
              {title && <h2 className="text-base md:text-lg font-bold text-[#12201A]">{title}</h2>}
              {description && <p className="text-xs text-[#5A6A61] font-medium mt-0.5">{description}</p>}
            </div>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="text-[#5A6A61] hover:text-[#12201A] transition-colors p-1.5 rounded-lg hover:bg-[#F0F6F3]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const ModalHeader = ({ title, description, children }) => (
  <div className="pb-3 mb-3 border-b border-[#E1E9E4]">
    {title && <h3 className="text-base font-bold text-[#12201A]">{title}</h3>}
    {description && <p className="text-xs text-[#5A6A61] font-medium mt-0.5">{description}</p>}
    {children}
  </div>
);

export const ModalBody = ({ children, className }) => (
  <div className={clsx("space-y-4 text-[#12201A]", className)}>{children}</div>
);

export const ModalFooter = ({ children, className }) => (
  <div className={clsx("pt-4 mt-4 border-t border-[#E1E9E4] flex items-center justify-end gap-3", className)}>
    {children}
  </div>
);

export default Modal;
