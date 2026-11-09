'use client';

import React from 'react';
import { shopApi } from '@/lib/shop/api';
import { useAsyncData } from '@/lib/useAsyncData';

interface AnnouncementBarProps {
  /** Set in the admin under Paramètres → Bandeau d'annonce. Hidden when empty. */
  text?: string;
}

/** Shows the admin's announcement. Pages that already have it pass `text`; others let it load. */
export default function AnnouncementBar({ text }: AnnouncementBarProps) {
  const { data } = useAsyncData(async () => (text === undefined ? shopApi.settings() : null), [text]);
  const message = text ?? data?.announcementText ?? '';
  if (!message) return null;
  return (
    <div className="bg-gradient-to-r from-[#f05b2a] to-[#faae3c] text-white text-center py-2.5 px-4 text-[13px] sm:text-[14px] font-normal tracking-wide border-b border-white/25 font-avantgarde">
      <p className="font-medium" style={{ fontFamily: 'var(--font-avantgarde)', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}
