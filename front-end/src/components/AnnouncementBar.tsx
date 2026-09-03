'use client';

import React from 'react';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#faede5] text-black text-center py-2.5 px-4 text-xs font-normal tracking-wide border-b border-[#f3dbcf]">
      <p>
        <span className="font-bold">1 000 DA offerts</span> dès 6 000 DA d&apos;achats pour toute nouvelle souscription au programme de fidélité. Code :{' '}
        <span className="font-extrabold uppercase">WELCOME5</span>
      </p>
    </div>
  );
}
