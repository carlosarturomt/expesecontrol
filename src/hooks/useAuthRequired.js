import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from "@context/userDataContext";

export default function useAuthRequired(navToIsNotAuth, navToIsAuth) {
    const { user } = useContext(UserDataContext);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulación de carga
        const timeoutId = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                navigate(navToIsAuth); // Redirige a la ruta especificada si el usuario ESTÁ autenticado
            } else {
                navigate(navToIsNotAuth); // Redirige a la ruta especificada si el usuario NO está autenticado
            }
        }
    }, [user, isLoading, navigate, navToIsNotAuth, navToIsAuth]);

    return { isLoading, isAuthenticated: !!user };
}
