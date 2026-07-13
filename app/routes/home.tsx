import type { Route } from "./+types/home";
import Landing from "../landing/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Insurance App" },
    { name: "description", content: "Welcome to my Insurance App!" },
  ];
}

export default function Home() {
  return <Landing />;
}
