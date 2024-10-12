import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";

// Lazy loading components
const Home = lazy(() => import("@components/pages/Home"));
const Spinner = lazy(() => import("@components/atoms/Spinner"));

export const Routes = () => {
	const routes = useRoutes([
		{ path: "/", element: <Home /> },
		{ path: "/*", element: 'Error' },
	]);

	return <Suspense fallback={<Spinner bgTheme={true} />}>{routes}</Suspense>;
};