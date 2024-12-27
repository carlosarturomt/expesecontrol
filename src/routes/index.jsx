import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import { Spinner } from "@components/atoms/Spinner";
import Layout from "@layout";

// Lazy loading components
const HomePage = lazy(() => import("@components/pages/HomePage"));
const TransactionsPage = lazy(() => import("@components/pages/TransactionsPage"));
const TransactionsGalleryPage = lazy(() => import("@components/pages/TransactionsGalleryPage"));
const ProfilePage = lazy(() => import("@components/pages/ProfilePage"));
const GastosDetallados = lazy(() => import("@components/pages/GastosDetallados"));
const DetailsIncome = lazy(() => import("@components/pages/DetailsIncome"));
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
				{ path: "/gallery", element: <TransactionsGalleryPage /> },
				{ path: "/profile", element: <ProfilePage /> },
				//{ path: "/expenses", element: <GastosDetallados /> },
				{ path: "/expenses/:anchor?", element: <GastosDetallados /> },
				{ path: "/incomes", element: <DetailsIncome /> },
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
