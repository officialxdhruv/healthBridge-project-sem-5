import { Link } from "@tanstack/react-router";
import { specialityData } from "../assets/assets_frontend/assets.ts";

export function SpecialityMenu() {
  return (
    <div id="speciality" className="flex flex-col items-center gap-4 py-16">
      <h1 className="text-3xl font-medium">Find by Speciality</h1>
      <p className="text-center text-sm sm:w-1/3">
        Simple browse through our extensive list of trusted doctors, schedule
        your appointment hassle-free
      </p>
      <div className="flex gap-4 overflow-scroll pt-5 sm:justify-center w-full">
        {specialityData.map((item) => (
          <Link
            key={item.speciality}
            to="/doctors/$speciality"
            params={{ speciality: item.speciality }}
            className="flex cursor-pointer flex-col items-center text-xs transition-all hover:-translate-y-2.5"
          >
            <img
              className="mb-2 w-16 sm:w-24"
              src={item.image}
              alt={item.speciality}
            />
            <p>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
