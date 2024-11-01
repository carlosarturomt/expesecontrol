import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserDataContext } from "@context/userDataContext";

export default function useAuthRequired(navToIsNotAuth, navToIsAuth) {
    const { user } = useContext(UserDataContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (user && location.pathname !== navToIsAuth) {
                setIsNavigating(true);
                navigate(navToIsAuth);
            } else if (!user && location.pathname !== navToIsNotAuth) {
                setIsNavigating(true);
                navigate(navToIsNotAuth);
            } else {
                setIsNavigating(false);
            }
        }
    }, [user, isLoading, navigate, navToIsNotAuth, navToIsAuth, location.pathname]);

    return { isLoading: isLoading || isNavigating, isAuthenticated: !!user };
}
