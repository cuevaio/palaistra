'use client';

import React from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

import { UploadButton } from '@/lib/uploadthing';

import { pay } from './pay.action';

export default function Home() {
  const [picUrl, setPicUrl] = React.useState<string>();
  const [state, action, pending] = React.useActionState(pay, null);

  if (!state?.ok) {
    if (state?.error === 'pic-url-required') {
      console.log('pic-url-required');
    }
  }
  return (
    <div>
      <h1>Palaistra</h1>
      <p>Soluciones tecnológicas al deporte</p>

      {picUrl && <Image src={picUrl} alt="Invoice" width={500} height={800} />}

      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log('Files: ', res);
          setPicUrl(res[0].url);
          alert('Upload Completed');
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      <form action={action}>
        <input name="pic-url" type="hidden" defaultValue={picUrl} />

        <Button type="submit" disabled={pending}>
          Continuar
        </Button>
      </form>
    </div>
  );
}
