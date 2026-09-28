import { Button } from "@healthbridge/ui/components/ui/button";
import { MoveRight } from "lucide-react";
import { assets } from "../assets/assets_frontend/assets.ts";

export function Header() {
  return (
    <div className="flex flex-col flex-wrap rounded-lg bg-accent px-6 dark:bg-card md:flex-row md:px-10 lg:px-20">
      <div className="m-auto flex flex-col items-start justify-center gap-4 py-10 md:-mb-7.5 md:w-1/2 md:py-[10vw]">
        <p className="text-3xl leading-tight font-semibold md:text-4xl lg:text-5xl">
          Book Appointment <br /> With Trusted Doctors
        </p>
        <div className="flex flex-col items-center gap-3 text-sm font-light md:flex-row">
          <img src={assets.group_profiles} alt="" className="w-28" />
          <p>
            Simply browse through our extensive list of trusted doctors,{" "}
            <br className="hidden sm:block" /> schedule your appointment
            hassle-free.{" "}
          </p>
        </div>
        <Button size="lg">
          <a href="#speciality" className="flex items-center gap-2">
            Book Appointment
            <MoveRight />
          </a>
        </Button>
      </div>
      <div className="relative md:w-1/2">
        <img
          src={assets.header_img}
          alt=""
          className="h-auto w-full rounded-lg md:absolute md:bottom-0"
        />
      </div>
    </div>
  );
}
