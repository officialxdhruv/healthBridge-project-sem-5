import type { RazorpayOrderOptions } from "react-razorpay";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOrderOptions) => {
      on: (
        event: "payment.failed",
        cb: (response: { error: { description?: string } }) => void,
      ) => void;
      open: () => void;
    };
  }
}

let razorpayPromise: Promise<Window["Razorpay"]> | undefined;

export function loadRazorpay(): Promise<Window["Razorpay"]> {
  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        razorpayPromise = undefined;
        reject(new Error("Unable to load payment script"));
      };
      document.body.appendChild(script);
    });
  }
  return razorpayPromise;
}
