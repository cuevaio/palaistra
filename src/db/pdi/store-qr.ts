import QRCode from 'qrcode';
import { UTApi, UTFile } from 'uploadthing/server';

// Function to generate QR code and return as buffer
async function generateQRBuffer(url: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 512,
      color: {
        dark: '#273856',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

// Create an API route to generate and upload QR code
export async function createQR(url: string) {
  const utapi = new UTApi();

  // Generate QR code buffer
  const qrBuffer = await generateQRBuffer(url);

  // Convert buffer to File object
  const file = new UTFile(
    [qrBuffer],
    `qr-${url.replace('https://pdi.palaistra.com.pe/', '')}.png`,
  );

  // Upload to UploadThing
  const response = await utapi.uploadFiles([file]);

  // Return the URL from UploadThing
  return response[0].data?.url;
}
