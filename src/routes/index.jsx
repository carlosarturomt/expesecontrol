import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";

// Lazy loading components
const App = lazy(() => import("../App"));
const Spinner = lazy(() => import("@components/atoms/Spinner"));
const LoginPage = lazy(() => import("../components/pages/LoginPage"));

export const Routes = () => {
	const routes = useRoutes([
		{ path: "/", element: <App /> },
		{ path: "/login", element: <LoginPage /> },
		{ path: "/*", element: 'Error' },
	]);

	return <Suspense fallback={<Spinner bgTheme={true} />}>{routes}</Suspense>;
};