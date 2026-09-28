import { Button } from "@healthbridge/ui/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { assets } from "../assets/assets_frontend/assets.ts";

export function Banner() {
  const navigate = useNavigate();
  return (
    <div className="my-20 flex rounded-lg bg-accent px-6 dark:bg-card sm:px-10 md:mx-10 md:px-14 lg:px-12">
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5">
        <div className="font-semibold text-xl sm:text-2xl md:text-3xl lg:text-5xl">
          <p>Book Appointment</p>
          <p>With 100+ Trusted Doctors</p>
        </div>
        <Button onClick={() => navigate({ to: "/login" })} className="mt-6">
          Create account
        </Button>
      </div>

      <div className="relative hidden md:block md:w-1/2 lg:w-92.5">
        <img
          src={assets.appointment_img}
          alt=""
          className="absolute right-0 bottom-0 w-full max-w-md"
        />
      </div>
    </div>
  );
}
