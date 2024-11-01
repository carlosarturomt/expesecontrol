import { ICONS } from "@assets/icons";
import { NavLink, useLocation } from "react-router-dom";

const NavigationFooter = () => {
    const location = useLocation().pathname

    return (
        <footer className="fixed w-[95%] max-w-screen-sm mx-auto bottom-3 rounded-full py-1 px-2 flex items-center justify-evenly font-semibold backdrop-blur-sm text-main-light bg-main-highlight/70 shadow-lg">
            <ul className="w-full flex items-center justify-between">
                <NavLink to={'/'} className={`flex-center rounded-full py-1 px-4 transition-all duration-700 ease-in-out text-main-dark
                ${location === '/' && 'bg-main-light'}
                `}>
                    <i className={`flex-center rounded-full hover:scale-105 transition-all duration-300 ease-in-out ${location === '/' ? 'w-9 h-9 px-1' : 'w-11 h-11 p-3 bg-main-light/40'}`}>{ICONS.home.fill(location === '/' ? "#1C1C1E" : "#F5F6FA")}</i>
                    <span className={`${location === '/' ? 'block px-1' : 'hidden'}`}>
                        Dashboard
                    </span>
                </NavLink>
                {/* Transacciones */}
                <NavLink to={!location.includes('transactions') && 'transactions'}
                    className={`flex-center gap-2 rounded-full py-1 px-4 transition-all duration-700 ease-in-out text-main-dark
                    ${location.includes('transactions') && 'bg-main-light'}
                    `}>
                    <i className={`flex-center rounded-full hover:scale-105 transition-all duration-300 ease-in-out ${location.includes('transactions') ? 'w-9 h-9 px-1' : 'w-11 h-11 p-3 bg-main-light/40'}`}>{ICONS.wallet.fill(location.includes('transactions') ? "#1C1C1E" : "#F5F6FA")}</i>
                    <span className={`${location.includes('transactions') ? 'block px-1' : 'hidden'}`}>
                        Transacciones
                    </span>
                </NavLink>
                <li className="flex-center gap-2">
                    <i className="flex-center w-11 h-11 p-3 rounded-full hover:scale-105 bg-main-light/40">{ICONS.barchart.fill("#F5F6FA")}</i>
                    {/* Análisis */}
                </li>
                <li className="flex-center gap-2">
                    <i className="flex-center w-11 h-11 p-3 rounded-full hover:scale-105 bg-main-light/40">{ICONS.star.fill("#F5F6FA")}</i>
                    {/* Metas */}
                </li>
            </ul>
        </footer>
    );
};

export { NavigationFooter };
