'use server';

import { ocr } from 'llama-ocr';

export type PayActionState =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export const pay = async (
  prevState: null | PayActionState,
  formData: FormData,
): Promise<PayActionState> => {
  const picUrl = formData.get('pic-url');

  if (!picUrl) {
    return {
      ok: false,
      error: 'pic-url-required',
    };
  }

  const markdown = await ocr({
    filePath: picUrl.toString(),
    apiKey: process.env.TOGETHER_API_KEY,
  });

  console.log(markdown);

  return {
    ok: true,
  };
};
