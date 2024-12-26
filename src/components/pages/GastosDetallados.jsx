import { useContext, useEffect, useState } from "react";
import { UserDataContext } from "@context/userDataContext";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { FilterButton, SwipeableCard } from "../atoms/Button";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import { deleteObject, ref } from "firebase/storage";
import { ICONS } from "@assets/icons";


// Registrar los elementos necesarios en ChartJS
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    BarElement
);

export default function GastosDetallados() {
    const { loading, userAuth, userData, state, setState } = useContext(UserDataContext);
    const [filteredGastos, setFilteredGastos] = useState([]);
    const [paymentChartData, setPaymentChartData] = useState({});
    const [chartData, setChartData] = useState(null); // Iniciar como null para control de carga
    const [period, setPeriod] = useState("current");
    const [expandedGastoId, setExpandedGastoId] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [totalGastos, setTotalGastos] = useState(0);

    const paymentTypeMapping = {
        card1: userData && userData.paymentTypes && userData.paymentTypes.card1,
        card2: userData && userData.paymentTypes && userData.paymentTypes.card2,
        card3: userData && userData.paymentTypes && userData.paymentTypes.card3,
        card4: userData && userData.paymentTypes && userData.paymentTypes.card4,
        card5: userData && userData.paymentTypes && userData.paymentTypes.card5,
        other: userData && userData.paymentTypes && userData.paymentTypes.other,
        cash: 'Efectivo',
    };

    useEffect(() => {
        if (!userData || !state.gastos || loading) return;

        const cutoffDay = parseInt(userData?.expenseControl?.cutoffDay, 10) || 12;
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let startDate, endDate;

        switch (period) {
            case "previous":
                startDate = new Date(currentYear, currentMonth - 1, cutoffDay);
                endDate = new Date(currentYear, currentMonth, cutoffDay - 1, 23, 59, 59);
                break;
            case "year":
                startDate = new Date(currentYear, 0, 1);
                endDate = new Date(currentYear, 11, 31);
                break;
            case "all":
                //setFilteredGastos(state.gastos);
                setFilteredGastos(state.gastos
                    .filter(gasto => gasto.title.toLowerCase().includes(filterText.toLowerCase()) || gasto.remarks.toLowerCase().includes(filterText.toLowerCase()) || gasto.category.toLowerCase().includes(filterText.toLowerCase()))
                    .sort((a, b) => b.createdAt - a.createdAt));

                return;
            default:
                startDate = new Date(currentYear, currentMonth - (currentDay < cutoffDay ? 1 : 0), cutoffDay);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, cutoffDay - 1, 23, 59, 59);
        }

        const gastosFiltrados = state.gastos.filter((gasto) => {
            const gastoDate = gasto.createdAt instanceof Date ? gasto.createdAt : gasto.createdAt.toDate();

            return gastoDate >= startDate && gastoDate <= endDate;
        });

        setTotalGastos(gastosFiltrados.reduce(
            (acc, gasto) => acc + (parseFloat(gasto.gasto) || 0),
            0
        ));

        setFilteredGastos(gastosFiltrados.filter(gasto => gasto.title.toLowerCase().includes(filterText.toLowerCase()) || gasto.remarks.toLowerCase().includes(filterText.toLowerCase()) || gasto.category.toLowerCase().includes(filterText.toLowerCase()))
            .sort((a, b) => b.createdAt - a.createdAt));
    }, [state.gastos, userData, period, loading, filterText]);

    useEffect(() => {
        if (filteredGastos.length === 0) {
            setChartData(null); // Resetear chartData si no hay datos
            return;
        }

        const groupedByCategory = filteredGastos.reduce((acc, gasto) => {
            if (!acc[gasto.category]) acc[gasto.category] = 0;
            acc[gasto.category] += parseFloat(gasto.gasto) || 0;
            return acc;
        }, {});


        const categoryMapping = {
            feeding: "Alimentación y Bebidas",
            transportation: "Transporte",
            health: "Salud y Bienestar",
            educationJob: "Gastos de Educación o Trabajo",
            housing: "Vivienda",
            entertainment: "Entretenimiento y Ocio",
            personalCare: "Ropa y Cuidado Personal",
        };

        // Mapear las categorías a sus nombres legibles
        const mappedCategoryLabels = Object.keys(groupedByCategory).map(category => categoryMapping[category] || category);

        const newChartData = {
            labels: mappedCategoryLabels,
            datasets: [
                {
                    label: "Gastos por Categoría",
                    data: Object.values(groupedByCategory),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                },
            ],
        };

        // Agrupar por tipo de pago
        const groupedByPaymentType = filteredGastos.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = 0;
            }
            acc[item.type] += parseFloat(item.gasto) || 0;
            return acc;
        }, {});

        const paymentLabels = Object.keys(groupedByPaymentType);
        const paymentValues = Object.values(groupedByPaymentType);

        const mappedPaymentLabels = paymentLabels.map((paymentType) => {
            return paymentTypeMapping[paymentType] || paymentType; // En caso de que no exista el tipo, usar el label original
        });

        // Configurar los datos del gráfico
        const chartData = {
            labels: mappedPaymentLabels,
            datasets: [
                {
                    label: "Gastos por Tipo de Pago",
                    data: paymentValues,
                    backgroundColor: ['#495867', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    borderColor: "#fff",
                    borderWidth: 1,
                },
            ],
        };

        setPaymentChartData(chartData);
        setChartData(newChartData);
    }, [filteredGastos, filterText]);

    const handleEdit = async (id) => {
        try {
            const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", id);
            const gastoSnap = await getDoc(gastoRef);

            if (gastoSnap.exists()) {
                const gastoData = gastoSnap.data();

                setState((prev) => ({
                    ...prev,
                    gasto: gastoData?.gasto || '',
                    title: gastoData?.title || '',
                    remarks: gastoData?.remarks || '',
                    category: gastoData?.category || '',
                    type: gastoData?.type || '',
                    date: gastoData?.createdAt
                        ? gastoData.createdAt.toDate().toISOString().substring(0, 10)
                        : '',
                    fileURL: gastoData?.fileURL || '',
                    isModalOpen: true,
                    currentGastoId: id,
                }));
            } else {
                console.error(`El gasto con ID: ${id} no existe.`);
            }
        } catch (error) {
            console.error("Error al obtener los datos del gasto:", error);
        }
    };

    const handleDelete = async (id, gasto, imageName) => {
        const confirmDelete = window.confirm(
            `¿Estás seguro de que deseas eliminar el gasto "${gasto.title}" de $${gasto.gasto}?`
        );

        if (confirmDelete) {
            try {
                const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", id);

                // Verificar que imageName esté definido y no vacío antes de intentar eliminar la imagen
                if (imageName && imageName.trim() !== "") {
                    const storageRef = ref(storage, `userFiles/${userAuth.username}/${imageName}`);
                    try {
                        await deleteObject(storageRef);
                        console.log("Imagen asociada eliminada de Storage.");
                    } catch (error) {
                        console.error("Error al eliminar la imagen de Storage: ", error);
                    }
                } else {
                    console.log("No se proporcionó una imagen para eliminar.");
                }

                // Elimina el documento del gasto en Firestore
                await deleteDoc(gastoRef);
                console.log("Gasto eliminado correctamente.");

                // Actualiza el estado local en lugar de recargar la página
                setState((prev) => ({
                    ...prev,
                    gastos: prev.gastos.filter((g) => g.id !== id), // Filtra el gasto eliminado
                }));
            } catch (error) {
                console.error("Error al eliminar el gasto: ", error);
                alert("No se pudo eliminar el gasto. Intenta nuevamente.");
            }
        }
    };

    const handleCardClick = (id) => {
        setExpandedGastoId(expandedGastoId === id ? null : id);
    };

    const handleFilter = (e) => {
        const value = e.target.value;

        // Actualizar el filtro de texto
        if (value !== undefined) {
            setFilterText(value);
        }
    };

    const items_filter = [
        {
            slug: handleFilter,
            label: "Todos",
            anchor: "",
        },
        {
            slug: handleFilter,
            label: "Alimentación y Bebidas",
            anchor: 'feeding',
        },
        {
            slug: handleFilter,
            label: "Transporte",
            anchor: "transportation",
        },
        {
            slug: handleFilter,
            label: "Salud y Bienestar",
            anchor: "health",
        },
        {
            slug: handleFilter,
            label: "Gastos de Educación o Trabajo",
            anchor: "educationJob",
        },
        {
            slug: handleFilter,
            label: "Vivienda",
            anchor: "housing",
        },
        {
            slug: handleFilter,
            label: "Entretenimiento y Ocio",
            anchor: "entertainment",
        },
        {
            slug: handleFilter,
            label: "Ropa y Cuidado Personal",
            anchor: "personalCare",
        },
    ];

    return (
        <section className="container mx-auto p-4 mb-20">
            <div className="relative py-2 mb-2 flex items-center">
                <div className="w-full flex-center pl-4 rounded-3xl bg-main-dark/5">
                    <i className="flex-center w-6 h-6 opacity-40">
                        {
                            ICONS.search.border("#1C1C1E")
                        }
                    </i>
                    <input
                        type="text"
                        placeholder="Filtrar gastos..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
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
            </div>
            {/* Filtros */}
            <div className="flex  items-center gap-3 mb-4">
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="current">Periodo Actual</option>
                    <option value="previous">Periodo Anterior</option>
                    <option value="year">Año Actual</option>
                    <option value="all">Todos los Gastos</option>
                </select>

                <p className="text-xl font-medium text-main-dark">
                    ${totalGastos.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>

            <hgroup className="mb-2">
                <h1 className="text-main-dark py-2 text-lg font-semibold border-b border-main-dark/20">Detalles de Gastos</h1>
                <p className="py-2 text-sm font-light text-main-dark/50">{filteredGastos.length} Resultados</p>
            </hgroup>

            {/* Gráficos */}
            <div className="flex gap-4 mb-4">
                {chartData ? (
                    <div className="w-full flex-center flex-col space-y-6">
                        {/* <div className="w-full flex-center">
                            <Pie data={chartData} />
                        </div> */}
                        <div className="w-full flex-center">
                            <Pie data={chartData} />
                        </div>
                        <div className="w-full flex-center">
                            <Bar data={paymentChartData} />
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Cargando gráficos...</p> // Mensaje de carga
                )}
            </div>

            <h2 className="text-lg font-bold mb-2">Listado de Gastos</h2>

            {/* Detalle de Gastos */}
            <ul className="space-y-3">
                {filteredGastos
                    .sort((a, b) => {
                        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                        return dateB - dateA; // De mayor a menor, para mostrar los más recientes primero
                    })
                    .map((gasto) => (
                        <SwipeableCard
                            key={gasto.id}
                            context={userData}
                            data={gasto}
                            onEdit={() => handleEdit(gasto.id)}
                            onDelete={() => handleDelete(gasto.id, gasto, gasto.image &&
                                gasto.image.name)}
                            expandedGastoId={expandedGastoId}
                            onCardClick={handleCardClick}
                        />
                    ))}
            </ul>

            {/* <div className="overflow-x-auto">
                <h2 className="text-lg font-bold mb-2">Listado de Gastos</h2>
                <table className="w-full table-auto border-collapse ">
                    <thead>
                        <tr className="text-sm bg-gray-200">
                            <th className="border px-4 py-2">Categoría</th>
                            <th className="border px-4 py-2">Monto</th>
                            <th className="border px-4 py-2">Fecha</th>
                            <th className="border px-4 py-2">Concepto</th>
                            <th className="border px-4 py-2">Observaciones</th>
                            <th className="border px-4 py-2">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGastos
                            .sort((a, b) => {
                                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                                return dateB - dateA; // De mayor a menor, para mostrar los más recientes primero
                            })
                            .map((gasto) => (
                                <tr key={gasto.id} className="border-t text-xs">
                                    <td className="border px-4 py-2">{gasto.category}</td>
                                    <td className="border px-4 py-2">${gasto.gasto.toFixed(2)}</td>
                                    <td className="border px-4 py-2">{new Date(gasto.createdAt).toLocaleDateString()}</td>
                                    <td className="border px-4 py-2">{gasto.title}</td>
                                    <td className="border px-4 py-2">{gasto.remarks}</td>
                                    <td className="border px-4 py-2">{paymentTypeMapping[gasto.type] || gasto.type}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div> */}
        </section>
    );
}
