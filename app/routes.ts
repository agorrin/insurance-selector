import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("api/carriers", "routes/api.carriers.ts"),
] satisfies RouteConfig;
