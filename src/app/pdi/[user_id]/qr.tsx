'use client';

import React from 'react';

import qrcode from 'qrcode-generator';

export const QRCode = ({ url, size = 256 }: { url: string; size?: number }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const generateQR = React.useCallback(
    (id: string) => {
      if (!id) return 
      const qr = qrcode(4, 'L');
      qr.addData(id);
      qr.make();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!ctx) return;
      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#273856');
      gradient.addColorStop(1, '#00617D');

      // Draw white rounded rectangle background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, 16);
      ctx.fill();

      const modules = qr.getModuleCount();
      const cellSize = (size * 0.9) / modules; // Make QR slightly smaller
      const offset = size * 0.05; // Add 5% padding

      // Draw QR code
      for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
          if (qr.isDark(row, col)) {
            const x = offset + col * cellSize;
            const y = offset + row * cellSize;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, cellSize, cellSize, cellSize * 0.2);
            ctx.fill();
          }
        }
      }
    },
    [canvasRef, size],
  );

  React.useEffect(() => {
    generateQR(url);
  }, [url, generateQR]);

  return (
    <div className="aspect-square w-full bg-white p-4">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="h-full w-full"
      />
    </div>
  );
};
