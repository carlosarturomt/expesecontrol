import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import { Spinner } from "@components/atoms/Spinner";
import Layout from "@layout";

// Lazy loading components
const HomePage = lazy(() => import("@components/pages/HomePage"));
const TransactionsPage = lazy(() => import("@components/pages/TransactionsPage"));
const ProfilePage = lazy(() => import("@components/pages/ProfilePage"));
const LoginPage = lazy(() => import("@components/pages/LoginPage"));
const RegisterPage = lazy(() => import("@components/pages/RegisterPage"));
const ErrorPage = lazy(() => import("@components/pages/ErrorPage"));

export const Routes = () => {
	const routes = useRoutes([
		{
			element: <Layout />,
			children: [
				{ path: "/", element: <HomePage /> },
				{ path: "/transactions", element: <TransactionsPage /> },
				{ path: "/profile", element: <ProfilePage /> },
			],
		},
		{ path: "/login", element: <LoginPage /> },
		{ path: "/register", element: <RegisterPage /> },
		{ path: "*", element: <ErrorPage /> },
	]);

	return (
		<Suspense fallback={<Spinner />}>
			{routes}
		</Suspense>
	);
};
