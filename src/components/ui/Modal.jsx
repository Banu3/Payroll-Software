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
          "w-full bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden text-[#111827] transform transition-all",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F6F3]">
            <div>
              {title && <h2 className="text-lg font-bold text-[#111827]">{title}</h2>}
              {description && <p className="text-xs text-[#374151] mt-0.5">{description}</p>}
            </div>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="text-[#6B7280] hover:text-[#111827] transition-colors p-1 rounded-lg hover:bg-[#E5E7EB]"
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
  <div className="pb-3 mb-3 border-b border-[#E5E7EB]">
    {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
    {description && <p className="text-xs text-slate-600 mt-0.5">{description}</p>}
    {children}
  </div>
);

export const ModalBody = ({ children, className }) => (
  <div className={clsx("space-y-4", className)}>{children}</div>
);

export const ModalFooter = ({ children, className }) => (
  <div className={clsx("pt-4 mt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3", className)}>
    {children}
  </div>
);

export default Modal;

