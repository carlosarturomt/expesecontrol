import { UserDataProvider } from "./context/userDataContext";
import ErrorBoundary from "./utils/ErrorBoundary";
import { Routes } from "./routes";

function App() {
	return (
		<ErrorBoundary>
			<UserDataProvider>
				<Routes />
			</UserDataProvider>
		</ErrorBoundary>
	);
}

export default App;