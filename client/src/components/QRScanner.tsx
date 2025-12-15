import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "./Button";
import { X } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onClose,
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scannerId = "reader";
    
    // Cleanup any existing DOM element content to be safe
    const element = document.getElementById(scannerId);
    if (element) {
        element.innerHTML = "";
    }

    const scanner = new Html5QrcodeScanner(
      scannerId,
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Successful scan
        scanner.clear().then(() => {
            onScanSuccess(decodedText);
        }).catch(err => console.error("Failed to clear scanner", err));
      },
      (_errorMessage) => {
        // parse error, ignore it.
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5-qrcode scanner. ", error);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="flex justify-center items-center p-4 border-b">
            <h3 className="text-lg font-bold">Scan Confirmation</h3>
            <Button
            variant="ghost"
            className="absolute right-2 top-2"
            onClick={onClose}
            >
            <X size={20} />
            </Button>
        </div>
        
        <div className="p-4 bg-gray-100">
             <div id="reader" className="w-full"></div>
        </div>
        
        <div className="p-4 text-center">
             <p className="text-sm text-gray-500">
            Ask the customer for their order QR code.
            </p>
        </div>
       
      </div>
    </div>
  );
};
