"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { PropsWithChildren } from "react";

export function LiveblocksProviders({ children }: PropsWithChildren) {
  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ?? ""}
    >
      {children}
    </LiveblocksProvider>
  );
}
