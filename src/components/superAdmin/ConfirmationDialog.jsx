import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmName,
  confirmText = 'Confirm Action',
  requireReason = false,
  reasonPlaceholder = 'Reason for this administrative action...',
  isLoading = false,
  variant = 'danger',
}) => {
  const [typedName, setTypedName] = useState('');
  const [reason, setReason] = useState('');

  const isTypedMatch = confirmName ? typedName.trim() === confirmName.trim() : true;
  const isReasonValid = requireReason ? reason.trim().length >= 5 : true;
  const canSubmit = isTypedMatch && isReasonValid && !isLoading;

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onConfirm({ reason: reason.trim() });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" title={title}>
      <form onSubmit={handleConfirmSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{description}</div>
        </div>

        {confirmName && (
          <div className="space-y-1.5">
            <p className="text-xs text-slate-300 font-medium">
              To confirm, type <strong className="text-rose-400 select-all font-mono">{confirmName}</strong> below:
            </p>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={confirmName}
              autoFocus
            />
          </div>
        )}

        {requireReason && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Reason for Suspension <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="md" onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={variant}
            size="md"
            isDisabled={!canSubmit}
            isLoading={isLoading}
            icon={ShieldAlert}
          >
            {confirmText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfirmationDialog;
