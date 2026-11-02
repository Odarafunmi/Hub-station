import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Shell from "@/components/Shell";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Hub Station — Uneek's private hub",
  description: "Soft, airy, cool teal-blue with a single coral signal — notes, voice, tasks and content.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F1F6F9",
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <ThemeScript />
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`}} />
      </body>
    </html>
  );
}

function ThemeScript(){
  const code = `(function(){
    try{
      var t=localStorage.getItem('hub-theme');
      if(t==='dark'||t==='light') document.documentElement.setAttribute('data-theme', t);
      else if(window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme','dark');
    }catch(e){}
  })()`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
