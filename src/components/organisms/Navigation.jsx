import { ICONS } from "@assets/icons";
import { NavLink, useLocation } from "react-router-dom";

const NavigationFooter = () => {
    const location = useLocation().pathname

    return (
        <footer className="fixed w-[95%] max-w-screen-sm mx-auto bottom-3 rounded-full p-2 flex items-center justify-evenly font-semibold backdrop-blur-sm text-main-light bg-main-highlight/70 shadow-lg">
            <ul className="w-full flex items-center justify-between">
                {/* Dashboard */}
                <NavLink to={'/'} className={`flex-center rounded-full transition-all duration-500 ease-in-out text-main-dark
                ${location === '/' && 'bg-main-light py-1 px-4'}
                `}>
                    <i className={`flex-center rounded-full transition-all duration-300 ease-in-out ${location === '/' ? 'w-9 h-9 px-1' : 'w-11 h-11 p-3 bg-main-light/40'}`}>{ICONS.home.fill(location === '/' ? "#1C1C1E" : "#F5F6FA")}</i>
                    <span className={`${location === '/' ? 'block px-1' : 'hidden'}`}>
                        Panel
                    </span>
                </NavLink>
                {/* Transacciones */}
                <NavLink to={!location.includes('transactions') && 'transactions'}
                    className={`flex-center gap-2 rounded-full transition-all duration-500 ease-in-out text-main-dark
                    ${location.includes('transactions') && 'bg-main-light py-1 px-4'}
                    `}>
                    <i className={`flex-center rounded-full transition-all duration-300 ease-in-out ${location.includes('transactions') ? 'w-9 h-9 px-1' : 'w-11 h-11 p-3 bg-main-light/40'}`}>{ICONS.wallet.fill(location.includes('transactions') ? "#1C1C1E" : "#F5F6FA")}</i>
                    <span className={`${location.includes('transactions') ? 'block pr-1' : 'hidden'}`}>
                        Transacciones
                    </span>
                </NavLink>
                {/* Análisis */}
                <NavLink to={!location.includes('gallery') && 'gallery'}
                    className={`flex-center gap-2 rounded-full transition-all duration-500 ease-in-out text-main-dark
                    ${location.includes('gallery') && 'bg-main-light py-1 px-4'}
                    `}>
                    <i className={`flex-center rounded-full transition-all duration-300 ease-in-out ${location.includes('gallery') ? 'w-9 h-9 px-1' : 'w-11 h-11 p-3 bg-main-light/40'}`}>{ICONS.barchart.fill(location.includes('gallery') ? "#1C1C1E" : "#F5F6FA")}</i>
                    <span className={`${location.includes('gallery') ? 'block pr-1' : 'hidden'}`}>
                        Galería
                    </span>
                </NavLink>
                {/* Metas */}
                <NavLink to={!location.includes('profile') && 'profile'}
                    className={`flex-center gap-2 rounded-full transition-all duration-500 ease-in-out text-main-dark
                    ${location.includes('profile') && 'bg-main-light py-1 px-4'}
                    `}>
                    <i className={`flex-center rounded-full transition-all duration-300 ease-in-out ${location.includes('profile') ? 'w-9 h-9 px-1' : 'w-11 h-11 p-3 bg-main-light/40'}`}>{ICONS.star.fill(location.includes('profile') ? "#1C1C1E" : "#F5F6FA")}</i>
                    <span className={`${location.includes('profile') ? 'block pr-1' : 'hidden'}`}>
                        Perfil
                    </span>
                </NavLink>
            </ul>
        </footer>
    );
};

export { NavigationFooter };
