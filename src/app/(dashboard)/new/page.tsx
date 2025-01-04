'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { AtomIcon, Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useUploadThing } from '@/lib/uploadthing';

import { createPalaistra } from './create-palaistra.action';

export default function Page() {
  const [picUrl, setPicUrl] = React.useState<string>();
  const picInputRef = React.useRef<HTMLInputElement | null>(null);

  const [state, action, pending] = React.useActionState(createPalaistra, null);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      setPicUrl(res[0].url);
    },
    onUploadError: () => {
      console.log('error occurred while uploading');
    },
    onUploadBegin: (filename) => {
      console.log('upload has begun for', filename);
    },
  });

  React.useEffect(() => {
    if (state?.ok) {
      router.push(`/${state.data.palaistra_id}/organizer`);
    }
  }, [state, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <form
        className="flex min-w-96 flex-col items-center space-y-4"
        action={action}
      >
        <Button
          type="button"
          size="icon"
          className="relative size-48 overflow-hidden"
          disabled={isUploading || pending}
          onClick={() => {
            picInputRef.current?.click();
          }}
        >
          {isUploading ? (
            <Loader2Icon className="!size-12 animate-spin" />
          ) : picUrl ? (
            <Image
              src={picUrl}
              fill
              className="object-cover p-2"
              alt="Profile picture"
            />
          ) : (
            <AtomIcon className="!size-12" />
          )}
          <input
            ref={picInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              startUpload([file]);
            }}
          />
        </Button>
        <input type="hidden" name='pic-url' defaultValue={picUrl} />
        <Input
          name="name"
          defaultValue={state?.form.name || 'Mi Academia Perú'}
          placeholder="El nombre de tu academia"
          disabled={pending}
          className=""
        />
        <Input
          name="handle"
          placeholder="Identificador único"
          defaultValue={state?.form.handle || 'mi-academia-pe'}
          disabled={pending}
        />

        <Button type="submit" className="w-full" disabled={pending}>
          Crear
        </Button>
      </form>
    </div>
  );
}
