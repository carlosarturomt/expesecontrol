import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import { Spinner } from "../components/atoms/Spinner";

// Lazy loading components
const Home = lazy(() => import("@components/pages/Home"));
const LoginPage = lazy(() => import("@components/pages/LoginPage"));
const RegisterPage = lazy(() => import("@components/pages/RegisterPage"));
const ErrorPage = lazy(() => import("@components/pages/ErrorPage"));

export const Routes = () => {
	const routes = useRoutes([
		{ path: "/", element: <Home /> },
		{ path: "/login", element: <LoginPage /> },
		{ path: "/register", element: <RegisterPage /> },
		{ path: "*", element: <ErrorPage /> },
	]);

	return (
		<Suspense fallback={<Spinner bgTheme={true} />}>
			{routes}
		</Suspense>
	);
};
