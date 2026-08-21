'use client';

import { createContext, useContext, useMemo, useState } from 'react';

const TalkContext = createContext({ openTalk: () => {} });

export function TalkProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openTalk: () => setOpen(true), open, setOpen }), [open]);
  return <TalkContext.Provider value={value}>{children}</TalkContext.Provider>;
}

export function useTalk() {
  return useContext(TalkContext);
}
