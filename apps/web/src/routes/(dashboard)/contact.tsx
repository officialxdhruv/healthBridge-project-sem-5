import { Button } from "@healthbridge/ui/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { assets } from "../../assets/assets_frontend/assets.ts";

export const Route = createFileRoute("/(dashboard)/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact Us | HealthBridge" }] }),
});

function ContactPage() {
  return (
    <div className="py-8">
      <div className="text-center text-2xl">
        <p className="font-semibold">CONTACT US</p>
      </div>

      <div className="my-10 mb-28 flex flex-col justify-center gap-20 text-sm md:flex-row">
        <img
          src={assets.contact_image}
          alt=""
          className="w-full rounded-xl md:max-w-90"
        />

        <div className="flex flex-col items-start justify-center gap-6">
          <p className="text-lg font-semibold">Our Office</p>
          <p className="text-muted-foreground">
            38/2083, Nai Wara, Delhi 110005, India
          </p>
          <p className="text-muted-foreground">Tel: +91 11 2345 6789</p>
          <p className="text-muted-foreground">Email: info@healthbridge.com</p>
          <p className="text-lg font-semibold">Careers at HealthBridge</p>
          <p className="text-muted-foreground">
            Learn more about our teams and job openings.
          </p>
          <Button>Explore Jobs</Button>
        </div>
      </div>
    </div>
  );
}
