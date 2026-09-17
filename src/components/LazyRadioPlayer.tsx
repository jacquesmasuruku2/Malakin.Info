'use client';

import dynamic from 'next/dynamic';

const RadioPlayer = dynamic(() => import('@/components/RadioPlayer'), {
  ssr: false,
});

export default function LazyRadioPlayer() {
  return <RadioPlayer />;
}
