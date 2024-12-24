import { useContext, useEffect, useState } from "react";
import useAuthRequired from "@hooks/useAuthRequired";
import { UserDataContext } from "@context/userDataContext";
import { Spinner } from "@components/atoms/Spinner";
import { ICONS } from "@assets/icons";
import { FilterButton } from "../atoms/Button";

export default function TransactionsGalleryPage() {
    const { isLoading, isAuthenticated } = useAuthRequired("/register", "/gallery");
    const { loading, userAuth, userData, state } = useContext(UserDataContext);
    const [filterText, setFilterText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [zoomedPostId, setZoomedPostId] = useState(null);

    useEffect(() => {
        // Filtrar datos basados en texto e imágenes válidas
        const filtered = state.gastos.filter(gasto =>
            (gasto.image?.imageURL || gasto.fileURL) && // Asegurar que tenga una imagen
            (
                gasto.title.toLowerCase().includes(filterText.toLowerCase()) ||
                gasto.category.toLowerCase().includes(filterText.toLowerCase()) ||
                gasto.remarks.toLowerCase().includes(filterText.toLowerCase())
            )
        );

        setFilteredData(filtered);
    }, [filterText, state.gastos]);

    const handleFilter = (e) => {
        setFilterText(e.target.value); // Actualizar el texto del filtro
    };

    const items_filter = [
        { slug: () => setFilterText(''), label: "Todos", anchor: "" },
        { slug: () => setFilterText('feeding'), label: "Alimentación y Bebidas", anchor: 'feeding' },
        { slug: () => setFilterText('transportation'), label: "Transporte", anchor: "transportation" },
        { slug: () => setFilterText('health'), label: "Salud y Bienestar", anchor: "health" },
        { slug: () => setFilterText('educationJob'), label: "Gastos de Educación o Trabajo", anchor: "educationJob" },
        { slug: () => setFilterText('housing'), label: "Vivienda", anchor: "housing" },
        { slug: () => setFilterText('entertainment'), label: "Entretenimiento y Ocio", anchor: "entertainment" },
        { slug: () => setFilterText('personalCare'), label: "Ropa y Cuidado Personal", anchor: "personalCare" },
    ];

    const handleZoomToggle = (postId) => {
        setZoomedPostId(prevZoomedPostId => prevZoomedPostId === postId ? null : postId);
    };

    if (isLoading) {
        return <Spinner bgTheme={true} />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            {/* Sección de Gastos Totales */}
            <section className="w-full max-w-screen-sm mt-6 py-3 flex flex-col items-center">
                <p className="text-main-dark/50">Galería de Tickets</p>
            </section>

            {/* Input y filtros */}
            <section className="relative py-2 mb-2 flex items-center">
                <div className="w-full flex-center pl-4 rounded-3xl bg-main-dark/5">
                    <i className="flex-center w-6 h-6 opacity-40">
                        {ICONS.search.border("#1C1C1E")}
                    </i>
                    <input
                        type="text"
                        placeholder="Filtrar gastos..."
                        value={filterText}
                        onChange={handleFilter}
                        className="w-full h-full pl-1 py-4 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                        required
                    />
                    <FilterButton
                        label={
                            <i className="flex-center w-6 h-6">
                                {ICONS.filter.fill("#C2185B")}
                            </i>}
                        items={items_filter}
                    />
                </div>
            </section>

            {/* Lista de gastos */}
            <section className="w-full max-w-screen-sm mb-20">
                <hgroup className="mb-4">
                    <h2 className="text-main-dark py-2 text-lg font-semibold border-b border-main-dark/20">Tickets de Gastos</h2>
                    <p className="py-2 text-sm font-light text-main-dark/50">{filteredData.length} Resultados</p>
                </hgroup>

                {loading ? (
                    <Spinner bgTheme={true} />
                ) : filteredData.length > 0 ? (
                    <ul className="w-full flex flex-wrap">
                        {filteredData
                            .sort((a, b) => b.createdAt - a.createdAt)
                            .map(gasto => (
                                <picture
                                    key={gasto.id}
                                    className={`${zoomedPostId === gasto.id ? 'w-full md:w-[72.666%]' : 'w-1/3 md:w-[24%]'
                                        } flex flex-col rounded-lg cursor-pointer transition-all duration-500 ease-in-out p-[1px]`}
                                    onClick={() => handleZoomToggle(gasto.id)}
                                >
                                    <img
                                        src={gasto.image?.imageURL || gasto.fileURL}
                                        alt={gasto.title}
                                        loading="lazy"
                                        className={`object-cover w-full h-full md:min-h-[200px] rounded-lg blurred-img bg-neutral-250 dark:bg-[#000e2c] ${zoomedPostId === gasto.id ? 'scale-110' : ''}`}
                                    />
                                </picture>
                            ))}
                    </ul>
                ) : (
                    <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                        <span className="text-main-dark font-medium">No hay tickets de gastos registrados</span>
                    </li>
                )}
            </section>
        </div>
    );
}
