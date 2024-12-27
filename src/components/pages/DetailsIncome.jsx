import { useContext, useEffect, useState } from "react";
import { UserDataContext } from "@context/userDataContext";
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { FilterButton, SwipeableCard } from "../atoms/Button";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
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

export default function DetailsIncome() {
    const { loading, userAuth, userData, state, setState } = useContext(UserDataContext);
    const [filteredIncomes, setFilteredIncomes] = useState([]);
    const [paymentChartData, setPaymentChartData] = useState({});
    const [chartData, setChartData] = useState(null); // Iniciar como null para control de carga
    const [period, setPeriod] = useState("current");
    const [expandedIncomeId, setExpandedIncomeId] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [totalIncomes, setTotalIncomes] = useState(0);
    const [charts, setCharts] = useState(true);
    const [chartCategory, setChartCategory] = useState(true);
    const [chartPaymentType, setChartPaymentType] = useState(true);

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
        if (!userData || !state.ingresos || loading) return;

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
                setFilteredIncomes(state.ingresos
                    .filter(income => income.title.toLowerCase().includes(filterText.toLowerCase()) || income.remarks.toLowerCase().includes(filterText.toLowerCase()) || income.category.toLowerCase().includes(filterText.toLowerCase()))
                    .sort((a, b) => b.createdAt - a.createdAt));
                return;
            default:
                startDate = new Date(currentYear, currentMonth - (currentDay < cutoffDay ? 1 : 0), cutoffDay);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, cutoffDay - 1, 23, 59, 59);
        }

        const incomesFiltered = state.ingresos.filter((income) => {
            const incomeDate = income.createdAt instanceof Date ? income.createdAt : income.createdAt.toDate();

            return incomeDate >= startDate && incomeDate <= endDate;
        });

        setTotalIncomes(incomesFiltered.reduce(
            (acc, income) => acc + (parseFloat(income.ingreso) || 0),
            0
        ));

        setFilteredIncomes(incomesFiltered.filter(income => income.title.toLowerCase().includes(filterText.toLowerCase()) || income.remarks.toLowerCase().includes(filterText.toLowerCase()) || income.category.toLowerCase().includes(filterText.toLowerCase()))
            .sort((a, b) => b.createdAt - a.createdAt));
    }, [state.ingresos, userData, period, loading, filterText]);

    useEffect(() => {
        if (filteredIncomes.length === 0) {
            setChartData(null); // Resetear chartData si no hay datos
            return;
        }

        const groupedByCategory = filteredIncomes.reduce((acc, income) => {
            if (!acc[income.category]) acc[income.category] = 0;
            acc[income.category] += parseFloat(income.ingreso) || 0;
            return acc;
        }, {});


        const categoryMapping = {
            feeding: "Alimentación y Bebidas",
            transportation: "Transporte",
            health: "Salud y Bienestar",
            educationJob: "Educación o Trabajo",
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
                    label: "Ingresos por Categoría",
                    data: Object.values(groupedByCategory),
                    //backgroundColor: ["#C2185B", "#c12048", "#ba1354", "#bf2b6d", "#cb1048", "#ce0864"],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(201, 203, 207, 0.2)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                        'rgb(201, 203, 207)'
                    ],
                    borderWidth: 1
                },
            ],
        };

        // Agrupar por tipo de pago
        const groupedByPaymentType = filteredIncomes.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = 0;
            }
            acc[item.type] += parseFloat(item.ingreso) || 0;
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
                    label: "Ingresos por Tipo de Pago",
                    data: paymentValues,
                    backgroundColor: [
                        'rgba(201, 203, 207, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgb(201, 203, 207)',
                        'rgb(153, 102, 255)',
                        'rgb(54, 162, 235)',
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 99, 132)',
                    ],
                    borderWidth: 1
                },
            ],
        };

        setPaymentChartData(chartData);
        setChartData(newChartData);
    }, [filteredIncomes, filterText]);

    const handleEdit = async (id) => {
        try {
            const ingresoRef = doc(db, "userPosts", userAuth.username, "ingresos", id);
            const incomeSnap = await getDoc(ingresoRef);

            if (incomeSnap.exists()) {
                const incomeData = incomeSnap.data();

                setState((prev) => ({
                    ...prev,
                    ingreso: incomeData?.ingreso || '',
                    title: incomeData?.title || '',
                    remarks: incomeData?.remarks || '',
                    category: incomeData?.category || '',
                    type: incomeData?.type || '',
                    date: incomeData?.createdAt
                        ? incomeData.createdAt.toDate().toISOString().substring(0, 10)
                        : '',
                    fileURL: incomeData?.fileURL || '',
                    isModalOpen: true,
                    currentIncomeId: id,
                }));
            } else {
                console.error(`El income con ID: ${id} no existe.`);
            }
        } catch (error) {
            console.error("Error al obtener los datos del income:", error);
        }
    };

    const handleDelete = async (id, income, imageName) => {
        const confirmDelete = window.confirm(
            `¿Estás seguro de que deseas eliminar el income "${income.title}" de $${income.ingreso}?`
        );

        if (confirmDelete) {
            try {
                const ingresoRef = doc(db, "userPosts", userAuth.username, "ingresos", id);

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

                // Elimina el documento del ingreso en Firestore
                await deleteDoc(ingresoRef);
                console.log("Ingreso eliminado correctamente.");

                // Actualiza el estado local en lugar de recargar la página
                setState((prev) => ({
                    ...prev,
                    ingresos: prev.ingresos.filter((g) => g.id !== id), // Filtra el ingreso eliminado
                }));
            } catch (error) {
                console.error("Error al eliminar el ingreso: ", error);
                alert("No se pudo eliminar el ingreso. Intenta nuevamente.");
            }
        }
    };

    const handleCardClick = (id) => {
        setExpandedIncomeId(expandedIncomeId === id ? null : id);
    };

    const handleFilter = (value) => {
        // Actualizar el filtro de texto
        if (value !== undefined) {
            setFilterText(value);
        }
    };

    const items_filterPeriod = [
        {
            slug: () => setPeriod('all'),
            label: "Todos los ingresos",
            icon: ICONS.all.border("#1C1C1E")
        },
        {
            slug: () => setPeriod('current'),
            label: "Periodo actual",
            icon: ICONS.today.border("#1C1C1E"),
        },
        {
            slug: () => setPeriod('previous'),
            label: "Periodo anterior",
            icon: ICONS.previous.border("#1C1C1E")
        },
        {
            slug: () => setPeriod('year'),
            label: "Año actual",
            icon: ICONS.calendar.border("#1C1C1E")
        }
    ];

    const items_filterCategory = [
        {
            slug: () => handleFilter(""),
            label: "Todas las categorías",
            anchor: "",
            icon: ICONS.all.border("#1C1C1E"),
        },
        {
            slug: () => handleFilter("feeding"),
            label: "Alimentación y bebidas",
            anchor: "feeding",
            icon: ICONS.restaurant.fill("#1C1C1E"),
        },
        {
            slug: () => handleFilter("transportation"),
            label: "Transporte",
            anchor: "transportation",
            icon: ICONS.transportation.border("#1C1C1E"),
        },
        {
            slug: () => handleFilter("health"),
            label: "Salud y bienestar",
            anchor: "health",
            icon: ICONS.care.border("#1C1C1E"),
        },
        {
            slug: () => handleFilter("educationJob"),
            label: "Educación o trabajo",
            anchor: "educationJob",
            icon: ICONS.ruler.border("#1C1C1E"),
        },
        {
            slug: () => handleFilter("housing"),
            label: "Vivienda",
            anchor: "housing",
            icon: ICONS.house.border("#1C1C1E"),
        },
        {
            slug: () => handleFilter("entertainment"),
            label: "Entretenimiento y ocio",
            anchor: "entertainment",
            icon: ICONS.theater_masks.border("#1C1C1E"),
        },
        {
            slug: () => handleFilter("personalCare"),
            label: "Ropa y cuidado personal",
            anchor: "personalCare",
            icon: ICONS.beauty.border("#1C1C1E"),
        },
    ];

    const closeModal = () => setState(prev => ({ ...prev, isModalOpen: false }));

    const formatCurrency = (value) => {
        // Eliminar caracteres no numéricos
        const cleanedValue = value.replace(/[^0-9]/g, "");

        // Formatear como moneda (por ejemplo, 666 se convierte en 6.66)
        if (cleanedValue.length === 0) return "";

        const numberValue = parseFloat(cleanedValue) / 100; // Dividir para convertir a formato de moneda
        return numberValue.toLocaleString("es-MX", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handleChange = (e) => {
        const { name, type, value, files } = e.target;

        if (type === "file") {
            // Si el tipo es "file", asigna el archivo directamente al estado
            setState((prev) => ({
                ...prev,
                [name]: files[0], // Asigna el primer archivo seleccionado
            }));
        } else {
            // Para otros tipos de input (como text)
            const formattedValue = name === "ingreso" ? formatCurrency(value) : value;

            setState((prev) => ({
                ...prev,
                [name]: formattedValue,
            }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        const cleanedValue = state[name].replace(/[^0-9]/g, "");
        const numberValue = cleanedValue.length === 0 ? "" : parseFloat(cleanedValue) / 100;

        // Al perder el foco, actualizar el valor en formato correcto
        setState((prev) => ({
            ...prev,
            [name]: numberValue.toLocaleString("es-MX", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setState(prev => ({ ...prev, isSubmitting: true }));

        // Validar el valor del ingreso
        const ingresoValue = parseFloat((state.ingreso || "").toString().replace(/[^0-9.-]+/g, ""));
        if (isNaN(ingresoValue) || ingresoValue <= 0) {
            setState(prev => ({ ...prev, error: "Por favor, ingresa un ingresp válido.", isSubmitting: false }));
            console.log('Por favor, ingresa un ingresp válido.');
            return;
        }

        // Ajuste para la fecha
        const date = state.date ? new Date(state.date + 'T00:00:00') : new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // Obtener la fecha de corte del usuario desde su perfil
        const userCutoffDay = userData?.expenseControl.cutoffDay || 1; // Valor por defecto al 1 si no está configurado

        const yearString = String(year);
        let period = "";

        // Determinación del periodo
        if (day < userCutoffDay) {
            switch (month) {
                case 0: period = "diciembreEnero"; break;
                case 1: period = "eneroFebrero"; break;
                case 2: period = "febreroMarzo"; break;
                case 3: period = "marzoAbril"; break;
                case 4: period = "abrilMayo"; break;
                case 5: period = "mayoJunio"; break;
                case 6: period = "junioJulio"; break;
                case 7: period = "julioAgosto"; break;
                case 8: period = "agostoSeptiembre"; break;
                case 9: period = "septiembreOctubre"; break;
                case 10: period = "octubreNoviembre"; break;
                case 11: period = "noviembreDiciembre"; break;
                default: period = "desconocido";
            }
        } else {
            switch (month) {
                case 0: period = "eneroFebrero"; break;
                case 1: period = "febreroMarzo"; break;
                case 2: period = "marzoAbril"; break;
                case 3: period = "abrilMayo"; break;
                case 4: period = "mayoJunio"; break;
                case 5: period = "junioJulio"; break;
                case 6: period = "julioAgosto"; break;
                case 7: period = "agostoSeptiembre"; break;
                case 8: period = "septiembreOctubre"; break;
                case 9: period = "octubreNoviembre"; break;
                case 10: period = "noviembreDiciembre"; break;
                case 11: period = "diciembreEnero"; break;
                default: period = "desconocido";
            }
        }

        try {
            let fileURL = state.fileURL; // Mantén la URL original del archivo si existe

            // Solo sube el archivo si el usuario ha seleccionado uno
            if (state.file) {
                const timestamp = Date.now();
                const fileName = `${state.title}_${timestamp}.${state.file.name.split('.').pop()}`;
                const storageRef = ref(storage, `userFiles/${userAuth.username}/${fileName}`);

                await uploadBytes(storageRef, state.file);
                fileURL = await getDownloadURL(storageRef);
            }

            // Prepara el objeto de datos a guardar
            const dataToSave = {
                ingreso: ingresoValue,
                title: state.title,
                remarks: state.remarks,
                type: state.type,
                category: state.category,
                user: userAuth.username,
                createdAt: date,
                year: yearString,
                period: period,
            };

            // Solo incluir fileURL si se obtuvo una URL válida
            if (fileURL) {
                dataToSave.fileURL = fileURL;
            }

            if (state.currentIncomeId) {
                const ingresoRef = doc(db, "userPosts", userAuth.username, "ingresos", String(state.currentIncomeId));
                await updateDoc(ingresoRef, dataToSave);
            } else {
                const ingresosRef = collection(db, "userPosts", userAuth.username, "ingresos");
                await addDoc(ingresosRef, dataToSave);
            }

            // Limpiar el estado después de la operación
            setState(prev => ({
                ...prev,
                ingreso: "",
                title: "",
                remarks: "",
                category: "",
                type: "",
                file: null,
                isModalOpen: false,
                error: "",
                currentIncomeId: null,
            }));

            setTimeout(() => location.reload(), 1000)
        } catch (error) {
            console.error("Error al subir datos: ", error);
            setState(prev => ({ ...prev, error: "Error al subir los datos: " + error.message, isSubmitting: false }));
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    return (
        <section className="mx-auto p-4 mb-20">
            <aside className="py-2 mb-2 flex justify-center flex-col gap-2">
                <div className="w-full flex-center pl-4 rounded-3xl bg-main-dark/5">
                    <i className="flex-center w-6 h-6 opacity-40">
                        {
                            ICONS.search.border("#1C1C1E")
                        }
                    </i>
                    <input
                        type="text"
                        placeholder="Filtrar ingresos..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full h-full pl-1 py-4 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                        required
                    />
                    <FilterButton
                        label={
                            <i className="flex-center w-6 h-6">
                                {ICONS.filter.fill("#00A86B")}
                            </i>}
                        titleSectionOne='Filtrar por periodo'
                        itemsSectionOne={items_filterPeriod}
                        titleSectionTwo='Filtrar por categoría'
                        itemsSectionTwo={items_filterCategory}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCharts((prev) => !prev)}
                        className={`flex-center w-10 h-10 p-2 rounded-full bg-main-highlight/70 text-main-light`}
                    >
                        {charts ? ICONS.chart.border('#F5F6FA') : ICONS.chart_line.border('#F5F6FA')}
                    </button>
                    <button
                        onClick={() => setChartCategory((prev) => !prev)}
                        className={`w-fit flex-center gap-1 h-10 px-4 rounded-3xl ${(chartCategory ? 'bg-main-highlight/70 text-main-light' : 'bg-main-dark/5 text-main-dark/50')}`}>
                        Categoría
                    </button>
                    <button
                        onClick={() => setChartPaymentType((prev) => !prev)}
                        className={`w-fit flex-center gap-1 h-10 px-4 rounded-3xl ${(chartPaymentType ? 'bg-main-highlight/70 text-main-light' : 'bg-main-dark/5 text-main-dark/50')}`}>
                        Método de pago
                    </button>
                </div>
            </aside>

            <hgroup className="mb-2">
                <h1 className="text-main-dark py-2 text-lg font-semibold border-b border-main-dark/20">Detalles de Ingresos</h1>
                <div className="flex items-center justify-between">
                    <p className="py-2 text-sm font-light text-main-dark/50">{filteredIncomes.length} Resultados</p>
                    <p className="py-2 text-sm font-light text-main-dark/50">${totalIncomes.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })} Gastados</p>
                </div>
            </hgroup>

            {/* Gráficos */}
            <div className="flex gap-4 mb-3">
                {chartData ? (
                    <div className="w-full flex-center flex-col space-y-3">
                        {chartCategory &&
                            <div className="w-full p-4 flex justify-center flex-col rounded-3xl bg-main-dark/5">
                                <h2 className="font-semibold mb-2">Intresos por categoría</h2>
                                {charts ? <Bar
                                    data={chartData}
                                    options={{
                                        indexAxis: 'y',
                                        plugins: {
                                            legend: {
                                                display: false,
                                                //position: 'bottom',
                                            },
                                        },
                                    }}
                                /> : <Line
                                    data={chartData}
                                    options={{
                                        indexAxis: 'y',
                                        plugins: {
                                            legend: {
                                                display: false,
                                                //position: 'bottom',
                                            },
                                        },
                                    }}
                                />
                                }
                            </div>
                        }
                        {chartPaymentType &&
                            <div className="w-full p-4 flex justify-center flex-col rounded-3xl bg-main-dark/5">
                                <h2 className="font-semibold mb-2">Intresos por tipo de pago</h2>
                                {charts ? <Bar
                                    data={paymentChartData}
                                    options={{
                                        //indexAxis: 'y',
                                        plugins: {
                                            legend: {
                                                display: false,
                                                //position: 'bottom',
                                            },
                                        },
                                    }}
                                /> :
                                    <Line
                                        data={paymentChartData}
                                        options={{
                                            //indexAxis: 'y',
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                    //position: 'bottom',
                                                },
                                            },
                                        }}
                                    />
                                }
                            </div>
                        }
                    </div>
                ) : chartData == null ? (
                    <p className="text-center text-gray-500">Sin resultados</p>
                ) : (
                    <p className="text-center text-gray-500">Cargando gráficos...</p>
                )}
            </div>

            {/* Detalle de Ingresos */}
            <ul className="space-y-3">
                {filteredIncomes
                    .sort((a, b) => {
                        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                        return dateB - dateA; // De mayor a menor, para mostrar los más recientes primero
                    })
                    .map((ingreso) => (
                        <SwipeableCard
                            key={ingreso.id}
                            context={userData}
                            data={ingreso}
                            onEdit={() => handleEdit(ingreso.id)}
                            onDelete={() => handleDelete(ingreso.id, ingreso, ingreso.image &&
                                ingreso.image.name)}
                            expandedGastoId={expandedIncomeId}
                            onCardClick={handleCardClick}
                        />
                    ))}
            </ul>

            {
                state.isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex-center z-50">
                        <div className="bg-white rounded-lg max-w-lg w-full h-[85vh] relative overflow-hidden">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <button onClick={closeModal} className="p-2 text-main-primary">Cancelar</button>

                                    <button
                                        type="submit"
                                        disabled={state.isSubmitting}
                                        className="p-2 text-main-highlight rounded hover:bg-main-primary-dark transition"
                                    >
                                        {state.isSubmitting ? "Guardando..." : (state.currentIncomeId ? "Actualizar" : "Agregar")}
                                    </button>
                                </div>

                                <div className="px-2">
                                    <hgroup className="rounded-3xl py-2 px-4 mb-4 bg-main-light">
                                        <input
                                            name="title"
                                            type="text"
                                            placeholder="Concepto"
                                            value={state.title}
                                            onChange={handleChange}
                                            className="w-full py-2 bg-transparent outline-none border-b border-main-dark/20 text-main-dark placeholder:text-main-dark/50"
                                            required
                                        />
                                        <div className="flex-center pt-2 py-2">
                                            $
                                            <input
                                                name="ingreso"
                                                type="text" // Mantener como texto para manejar el formato
                                                placeholder="$ $"
                                                value={state.ingreso}
                                                onChange={handleChange}
                                                onBlur={handleBlur} // Formato al perder el foco
                                                className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                                required
                                            />
                                            {!loading && userData?.expenseControl.currency}
                                        </div>
                                    </hgroup>

                                    <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                        <select name="type" value={state.type} onChange={handleChange} className="w-full bg-transparent outline-none">
                                            <option value="" hidden className="text-main-gray">Pago con</option>
                                            {userData.incomeControl.paymentTypes.type1 &&
                                                <option value={"type1"}>{userData.incomeControl.paymentTypes.type1}</option>}
                                            {userData.incomeControl.paymentTypes.type2 &&
                                                <option value={"type2"}>{userData.incomeControl.paymentTypes.type2}</option>
                                            }
                                            {userData.incomeControl.paymentTypes.type3 &&
                                                <option value={"type3"}>{userData.incomeControl.paymentTypes.type3}</option>
                                            }
                                            {userData.incomeControl.paymentTypes.type4 &&
                                                <option value={"type4"}>{userData.incomeControl.paymentTypes.type4}</option>
                                            }
                                            {userData.incomeControl.paymentTypes.type5 &&
                                                <option value={"type5"}>{userData.incomeControl.paymentTypes.type5}</option>
                                            }
                                            {userData.incomeControl.paymentTypes.other &&
                                                <option value={"other"}>{userData.incomeControl.paymentTypes.other}</option>
                                            }
                                            <option value={"cash"}>Efectivo</option>
                                        </select>
                                    </div>

                                    <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                        <select name="category" value={state.category} onChange={handleChange} className="w-full bg-transparent outline-none">
                                            <option value={"salary"}>Salario</option>
                                            <option value={"business"}>Negocios</option>
                                            <option value={"investment"}>Inversiones</option>
                                            <option value={"other"}>Otros Ingresos</option>
                                        </select>
                                    </div>

                                    <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                        <input
                                            id="date"
                                            name="date"
                                            type="date"
                                            value={state.date}
                                            onChange={handleChange}
                                            className="w-full bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                        />
                                    </div>

                                    {!state.currentIncomeId &&
                                        <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                            <input
                                                name="file"
                                                type="file"
                                                onChange={handleChange}
                                                className="w-full"
                                                accept="image/*, .pdf"
                                            />
                                        </div>
                                    }

                                    <textarea
                                        name="remarks"
                                        placeholder="Observaciones"
                                        value={state.remarks}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full rounded-3xl p-4 mb-4 outline-none bg-main-light"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </section >
    );
}
