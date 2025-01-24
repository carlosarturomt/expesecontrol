import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserDataContext } from "@context/userDataContext";

export default function useAuthRequired(navToIsNotAuth, navToIsAuth) {
	const { userAuth, loading } = useContext(UserDataContext);
	const [isNavigating, setIsNavigating] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		// Si el usuario está autenticado y no está en la ruta de autenticación
		if (userAuth && location.pathname !== navToIsAuth) {
			setIsNavigating(true);
			navigate(navToIsAuth);
		}
		// Si el usuario no está autenticado y no está en la ruta de no autenticación
		else if (!userAuth && location.pathname !== navToIsNotAuth) {
			setIsNavigating(true);
			navigate(navToIsNotAuth);
		} else {
			setIsNavigating(false);
		}
	}, [userAuth, navigate, navToIsNotAuth, navToIsAuth, location.pathname]);

	//console.log(user)

	return { isLoading: loading || isNavigating, isAuthenticated: !!userAuth };
}
