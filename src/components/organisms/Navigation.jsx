import { ICONS } from "@assets/icons";

const NavigationFooter = () => {
    return (
        <footer className="fixed w-11/12 max-w-screen-sm mx-auto bottom-4 rounded-3xl p-2 flex items-center justify-center font-semibold backdrop-blur-sm text-main-light bg-main-highlight/70 shadow-lg px-6">
            <ul className="w-full flex items-center justify-between">
                <li className="flex-center gap-2">
                    <i className="flex-center w-11 h-11 p-3 rounded-full hover:scale-105 bg-main-light">{ICONS.home.fill("#1C1C1E")}</i>
                    Dashboard
                </li>
                <li className="flex-center gap-2">
                    <i className="flex-center w-11 h-11 p-3 rounded-full hover:scale-105 bg-main-light/40">{ICONS.wallet.fill("#F5F6FA")}</i>
                    {/* Transacciones */}
                </li>
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
