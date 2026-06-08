import React, { useState } from 'react';
import { clearSessionExpiredFlag } from '../utils/sessions';
import QRScanner from './QRScanner';

export default function SessionExpiredPopup({ open, onClose }) {
  const [showScanner, setShowScanner] = useState(false);

  if (!open) return null;

  const handleRescanQR = () => {
    setShowScanner(true);
  };

  const handleScanSuccess = (decodedText) => {
    clearSessionExpiredFlag();
    window.location.href = decodedText;
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  if (showScanner) {
    return <QRScanner onScanSuccess={handleScanSuccess} onClose={handleScannerClose} />;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 16,
      }}
      onClick={(e) => {
        // không cho tắt bằng click nền
        e.preventDefault();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: 16,
          padding: 20,
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 38, marginBottom: 8 }}>⏳</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', marginBottom: 10 }}>
          Phiên gọi món đã hết hạn
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 18 }}>
          Vui lòng quét lại QR.
        </div>
        <button
          onClick={handleRescanQR}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Quét lại QR
        </button>
      </div>
    </div>
  );
}

