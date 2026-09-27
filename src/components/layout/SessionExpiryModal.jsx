import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SessionExpiryModal = () => {
  const { sessionExpiredModalOpen, closeSessionExpiredModal } = useAuth();

  return (
    <Modal
      isOpen={sessionExpiredModalOpen}
      onClose={closeSessionExpiredModal}
      showCloseButton={false}
      maxWidth="max-w-md"
    >
      <div className="text-center py-2 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Your session has expired.</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            For security reasons, your active login session has timed out. Please sign in again to continue working.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            className="w-full"
            icon={LogIn}
            onClick={closeSessionExpiredModal}
          >
            Sign in again
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SessionExpiryModal;
