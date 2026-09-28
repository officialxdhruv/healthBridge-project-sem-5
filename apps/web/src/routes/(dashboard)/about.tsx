import { Card } from "@healthbridge/ui/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { assets } from "../../assets/assets_frontend/assets.ts";

export const Route = createFileRoute("/(dashboard)/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "About Us | HealthBridge" }] }),
});

function AboutPage() {
  return (
    <div>
      <div className="text-center text-2xl">
        <p className="font-bold">ABOUT US</p>
      </div>

      <div className="my-10 flex flex-col justify-center gap-12 md:flex-row">
        <img
          src={assets.about_image}
          alt=""
          className="w-full rounded-xl md:max-w-90"
        />
        <div className="flex flex-col justify-center gap-6 text-sm text-muted-foreground md:w-2/4">
          <p>
            Welcome To HealthBridge, Your Trusted Partner In Managing Your
            Healthcare Needs Conveniently And Efficiently. At HealthBridge, We
            Understand The Challenges Individuals Face When It Comes To
            Scheduling Doctor Appointments And Managing Their Health Records.
          </p>
          <p>
            HealthBridge Is Committed To Excellence In Healthcare Technology. We
            Continuously Strive To Enhance Our Platform, Integrating The Latest
            Advancements To Improve User Experience And Deliver Superior
            Service. Whether You&apos;re Booking Your First Appointment Or
            Managing Ongoing Care, HealthBridge Is Here To Support You Every
            Step Of The Way.
          </p>
          <p className="font-bold text-primary">Our Vision</p>
          <p>
            Our Vision At HealthBridge Is To Create A Seamless Healthcare
            Experience For Every User. We Aim To Bridge The Gap Between Patients
            And Healthcare Providers, Making It Easier For You To Access The
            Care You Need, When You Need It.
          </p>
        </div>
      </div>

      <div className="my-4 text-xl">
        <p className="font-semibold">Why Choose Us</p>
      </div>

      <div className="mb-20 flex flex-col gap-10 md:flex-row">
        <div className="flex flex-1 flex-col gap-5 md:px-4">
          <Card className="flex flex-1 flex-col">
            <b>EFFICIENCY:</b>
            <p>
              Streamlined Appointment Scheduling That Fits Into Your Busy
              Lifestyle.
            </p>
          </Card>
        </div>
        <div className="flex flex-1 flex-col gap-5 md:px-4">
          <Card className="flex flex-1 flex-col">
            <b>CONVENIENCE:</b>
            <p>
              Access To A Network Of Trusted Healthcare Professionals In Your
              Area.
            </p>
          </Card>
        </div>
        <div className="flex flex-1 flex-col gap-5 md:px-4">
          <Card className="flex flex-1 flex-col">
            <b>PERSONALIZATION</b>
            <p>
              Tailored Recommendations And Reminders To Help You Stay On Top Of
              Your Health.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
