import { useQuery } from "@tanstack/react-query";
import { doctorsQueryOptions } from "../lib/user.ts";

export function useDoctors() {
  return useQuery(doctorsQueryOptions());
}
