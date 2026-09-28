import about_image from "./about_image.png";
import appointment_img from "./appointment_img.png";
import contact_image from "./contact_image.png";
import Dermatologist from "./Dermatologist.svg";
import Gastroenterologist from "./Gastroenterologist.svg";
import General_physician from "./General_physician.svg";
import group_profiles from "./group_profiles.png";
import Gynecologist from "./Gynecologist.svg";
import header_img from "./header_img.png";
import info_icon from "./info_icon.svg";
import Neurologist from "./Neurologist.svg";
import Pediatricians from "./Pediatricians.svg";
import upload_icon from "./upload_icon.png";
import verified_icon from "./verified_icon.svg";

import { SPECIALITIES } from "../../lib/specialities.ts";

export const assets = {
  appointment_img,
  header_img,
  group_profiles,
  verified_icon,
  info_icon,
  contact_image,
  about_image,
  upload_icon,
};

const specialityImages: Record<string, string> = {
  "General physician": General_physician,
  Gynecologist,
  Dermatologist,
  Pediatricians,
  Neurologist,
  Gastroenterologist,
};

export const specialityData = SPECIALITIES.map((speciality) => ({
  speciality,
  image: specialityImages[speciality],
}));
