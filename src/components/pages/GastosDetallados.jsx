import { useContext, useEffect, useState } from "react";
import { UserDataContext } from "@context/userDataContext";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

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
    const { state, loading, userData } = useContext(UserDataContext);
    const [filteredGastos, setFilteredGastos] = useState([]);
    const [paymentChartData, setPaymentChartData] = useState({});
    const [chartData, setChartData] = useState(null); // Iniciar como null para control de carga
    const [period, setPeriod] = useState("current");

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
                setFilteredGastos(state.gastos);
                return;
            default:
                startDate = new Date(currentYear, currentMonth - (currentDay < cutoffDay ? 1 : 0), cutoffDay);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, cutoffDay - 1, 23, 59, 59);
        }

        const gastosFiltrados = state.gastos.filter((gasto) => {
            const gastoDate = gasto.createdAt instanceof Date ? gasto.createdAt : gasto.createdAt.toDate();
            return gastoDate >= startDate && gastoDate <= endDate;
        });
        setFilteredGastos(gastosFiltrados);
    }, [state.gastos, userData, period, loading]);

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
    }, [filteredGastos]);

    return (
        <section className="container mx-auto p-4 mb-20">
            <h1 className="text-xl font-bold mb-4">Detalles de Gastos</h1>

            {/* Filtros */}
            <div className="mb-4">
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
            </div>

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

            {/* Detalle de Gastos */}
            <div className="overflow-x-auto">
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
            </div>
        </section>
    );
}
