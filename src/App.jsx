import { UserDataContext } from "./context/userDataContext";
import { useContext } from "react";
import { RegisterPage } from "./components/pages/RegisterPage";
import ProfilePage from "./components/pages/ProfilePage";

function App() {
	const { user } = useContext(UserDataContext);

    return user ? <ProfilePage /> : <RegisterPage />;
}

export default App;