"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const CALENDAR_SCHEDULE_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3gd0RMszA0nBtLHnq41hRBGxhgQ_Ha9Ks7_4pvD9UuaF7oghjow_fgaF4k5iG_Nc3D6b71AXAT?gv=true";

type CalendarScheduling = {
  schedulingButton: {
    load: (config: {
      url: string;
      color: string;
      label: string;
      target: HTMLElement;
    }) => void;
  };
};

declare global {
  interface Window {
    calendar?: CalendarScheduling;
  }
}

export function GoogleCalendarButton() {
  const targetRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://calendar.google.com/calendar/scheduling-button-script.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  function mountButton() {
    if (loadedRef.current || !targetRef.current || !window.calendar?.schedulingButton) return;
    window.calendar.schedulingButton.load({
      url: CALENDAR_SCHEDULE_URL,
      color: "#039BE5",
      label: "Book an appointment",
      target: targetRef.current,
    });
    loadedRef.current = true;
  }

  useEffect(() => {
    if (document.readyState === "complete") {
      mountButton();
    } else {
      window.addEventListener("load", mountButton);
      return () => window.removeEventListener("load", mountButton);
    }
  }, []);

  return (
    <>
      <Script
        src="https://calendar.google.com/calendar/scheduling-button-script.js"
        strategy="lazyOnload"
        onLoad={mountButton}
      />
      <div ref={targetRef} className="flex justify-center [&_iframe]:!mx-auto" />
    </>
  );
}
