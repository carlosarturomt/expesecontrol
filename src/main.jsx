import React, { useLayoutEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import ErrorBoundary from "./utils/ErrorBoundary";
import { UserDataProvider } from "./context/userDataContext";
import { Routes } from "./routes";

const container = document.getElementById("root")
const root = createRoot(container)

const Wrapper = ({ children }) => {
	const location = useLocation()
	useLayoutEffect(() => {
		document.documentElement.scrollTo(0, 0)
	}, [location.pathname])
	return children
}

root.render(
	<BrowserRouter>
		<Wrapper>
			<React.StrictMode>
				<ErrorBoundary>
					<UserDataProvider>
						<Routes />
					</UserDataProvider>
				</ErrorBoundary>
			</React.StrictMode>
		</Wrapper>
	</BrowserRouter>
)