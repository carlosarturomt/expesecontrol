import { Outlet } from "react-router-dom";
import { NavigationFooter } from "@components/organisms/Navigation";

export default function Layout() {
    return (
        <main className="relative h-full p-3 flex-center bg-primary-light">
            <section className="w-full h-full max-w-screen-sm">
                <Outlet /> {/* Renderiza el contenido de las rutas anidadas */}
            </section>
            <NavigationFooter /> {/* Footer de navegación siempre visible */}
        </main>
    );
}
