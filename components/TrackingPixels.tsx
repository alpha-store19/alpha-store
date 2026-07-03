"use client"

import { useEffect } from "react"
import { usePathname } from "next/script"

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || ""
const TT_PIXEL_ID = process.env.NEXT_PUBLIC_TT_PIXEL_ID || ""
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ""

export default function TrackingPixels() {
  const pathname = usePathname()

  useEffect(() => {
    if (FB_PIXEL_ID) {
      // Init FB Pixel
      ;(window as any).fbq = function (...args: any[]) {
        ;(window as any).fbq.callMethod ? (window as any).fbq.callMethod.apply(null, args) : (window as any).fbq.queue.push(args)
      }
      if (!(window as any)._fbq) (window as any)._fbq = (window as any).fbq
      ;(window as any).fbq.push = (window as any).fbq
      ;(window as any).fbq.loaded = true
      ;(window as any).fbq.version = "2.0"
      ;(window as any).fbq.queue = []
      ;(window as any).fbq("init", FB_PIXEL_ID)
      ;(window as any).fbq("track", "PageView")
    }

    if (TT_PIXEL_ID) {
      ;(window as any).ttq = { push: (...args: any[]) => {} }
      ;(window as any).ttq.push(["init", TT_PIXEL_ID])
      ;(window as any).ttq.push(["track", "PageView"])
    }

    if (GA_ID) {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      function gtag(...args: any[]) { (window as any).dataLayer.push(args) }
      ;(window as any).gtag = gtag
      gtag("js", new Date())
      gtag("config", GA_ID)
    }
  }, [])

  useEffect(() => {
    if (FB_PIXEL_ID && typeof (window as any).fbq === "function") {
      ;(window as any).fbq("track", "PageView")
    }
    if (TT_PIXEL_ID && typeof (window as any).ttq?.pageView === "function") {
      ;(window as any).ttq.pageView()
    }
  }, [pathname])

  return (
    <>
      {FB_PIXEL_ID && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
      {TT_PIXEL_ID && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
              ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
              var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
              var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${TT_PIXEL_ID}');
              ttq.page();
            `,
          }}
        />
      )}
      {GA_ID && (
        <script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          async
        />
      )}
      {GA_ID && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
      )}
    </>
  )
}
