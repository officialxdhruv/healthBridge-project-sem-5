import { CalendarRange } from "lucide-react";

export function Footer() {
  return (
    <div>
      <div className="md:mx-10">
        <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-5 font-medium">
              <CalendarRange className="size-6" />
              <span className="text-xl">HealthBridge</span>
            </div>
            <p className="w-full md:w-2/3 text-muted-foreground leading-6">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas
              ducimus id ullam rerum placeat inventore quasi sint dicta
              architecto nulla eveniet repellat, iure quod accusamus recusandae
              possimus, maiores velit quidem.
            </p>
          </div>
          <div>
            <p className="text-xl font-medium mb-5">Company</p>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li>Home</li>
              <li>About us</li>
              <li>Contact us</li>
              <li>Privacy policy</li>
            </ul>
          </div>
          <div>
            <p className="text-xl font-medium mb-5">Get in Touch</p>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li>+91 987654321</li>
              <li>johnDoe@gmail.com</li>
            </ul>
          </div>
        </div>
        <div>
          <hr />
          <p className="py-5 text-sm text-center">
            Copyright 2026@ HealthBridge - All Right Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
