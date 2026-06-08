import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onClose }) {
  const scannerRef = useRef(null);
  const htmlScannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-scanner-container',
      {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        videoConstraints: { facingMode: 'environment' },
      },
      false
    );

    htmlScannerRef.current = scanner;

    const onScanSuccessHandler = (decodedText) => {
      scanner.clear();
      onScanSuccess(decodedText);
    };

    scanner.render(onScanSuccessHandler, (error) => {
      // Ignore scanning errors
    });

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess]);

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
        <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', marginBottom: 10 }}>
          Quét mã QR
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 18 }}>
          Hướng camera về mã QR trên bàn
        </div>

        <div
          ref={scannerRef}
          id="qr-scanner-container"
          style={{
            marginBottom: 18,
            borderRadius: 12,
            overflow: 'hidden',
            background: '#000',
          }}
        />

        <button
          onClick={onClose}
          style={{
            background: '#999',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
