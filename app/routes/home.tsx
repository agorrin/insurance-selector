import type { Route } from "./+types/home";
import Landing from "../landing/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Obie Insurance App" },
    { name: "description", content: "Welcome to my Obie Insurance App!" },
  ];
}

export default function Home() {
  return <Landing />;
}
