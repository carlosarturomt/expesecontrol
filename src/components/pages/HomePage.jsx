import { useContext, useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import { UserDataContext } from "@context/userDataContext";
import useAuthRequired from "@hooks/useAuthRequired";
import { Spinner } from "@components/atoms/Spinner";
import { ICONS } from "@assets/icons";

import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,);

export default function HomePage() {
    const { isAuthenticated } = useAuthRequired("/register", "/");
    const { loading, userAuth, userData, state, setState } = useContext(UserDataContext);
    const [totalGastos, setTotalGastos] = useState(0);
    const [filteredGastos, setFilteredGastos] = useState([]);
    const [isIncome, setIsIncome] = useState(false);

    useEffect(() => {
        if (!userData || !state.gastos || loading) return;

        const cutoffDay = parseInt(userData?.expenseControl?.cutoffDay, 10) || 12;
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Calcular el rango de fechas
        const startDate = new Date(
            currentYear,
            currentMonth - (currentDay < cutoffDay ? 1 : 0), // Mes anterior si el día actual es menor al cutoff
            cutoffDay
        );

        const endDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth() + 1, // Un mes después del startDate
            cutoffDay - 1,
            23,
            59,
            59
        );

        // Filtrar los gastos
        const gastosFiltrados = state.gastos.filter((gasto) => {
            const gastoDate = gasto.createdAt instanceof Date ? gasto.createdAt : gasto.createdAt.toDate();
            //console.log("GastoDate:", gastoDate, "Dentro del rango:", gastoDate >= startDate && gastoDate <= endDate);
            return gastoDate >= startDate && gastoDate <= endDate;
        });

        //console.log("Gastos filtrados:", gastosFiltrados);
        setFilteredGastos(gastosFiltrados);

        // Calcular el total
        const total = gastosFiltrados.reduce(
            (acc, gasto) => acc + (parseFloat(gasto.gasto) || 0),
            0
        );
        setTotalGastos(total);
    }, [state.gastos, userData, loading]);

    useEffect(() => {
        if (state.isModalOpen) {
            document.body.style.overflow = "hidden"; // Desactivar scroll
        } else {
            document.body.style.overflow = "unset"; // Reactivar scroll
        }

        return () => {
            document.body.style.overflow = "unset"; // Asegurarse de que se reactiva al desmontar
        };
    }, [state.isModalOpen]);


    const openModal = () => setState(prev => ({ ...prev, isModalOpen: true }));
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
            const formattedValue = name === "gasto" ? formatCurrency(value) : value;

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

    const handleSubmit = async (e, isIncome = false) => {
        e.preventDefault();
        setState((prev) => ({ ...prev, isSubmitting: true }));

        const value = parseFloat((state[isIncome ? "ingreso" : "gasto"] || "").toString().replace(/[^0-9.-]+/g, ""));
        if (isNaN(value) || value <= 0) {
            setState((prev) => ({
                ...prev,
                error: `Por favor, ingresa un ${isIncome ? "ingreso" : "gasto"} válido.`,
                isSubmitting: false,
            }));
            console.log('ingreso');
            return;

        }

        const date = state.date ? new Date(state.date + "T00:00:00") : new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const userCutoffDay = userData?.expenseControl.cutoffDay || 1;
        const yearString = String(year);
        let period = "";

        // Lógica del periodo (sin cambios)
        if (day < userCutoffDay) {
            period = [
                "diciembreEnero", "eneroFebrero", "febreroMarzo", "marzoAbril",
                "abrilMayo", "mayoJunio", "junioJulio", "julioAgosto",
                "agostoSeptiembre", "septiembreOctubre", "octubreNoviembre", "noviembreDiciembre",
            ][month] || "desconocido";
        } else {
            period = [
                "eneroFebrero", "febreroMarzo", "marzoAbril", "abrilMayo",
                "mayoJunio", "junioJulio", "julioAgosto", "agostoSeptiembre",
                "septiembreOctubre", "octubreNoviembre", "noviembreDiciembre", "diciembreEnero",
            ][month] || "desconocido";
        }

        try {
            let fileURL = state.fileURL;
            let fileName;

            if (state.file) {
                const now = new Date();
                const timestamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
                const hourStamp = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
                const cleanFileName = state.file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                fileName = `IMG_${timestamp}-EC${hourStamp}.${cleanFileName.split(".").pop()}`;

                const storageRef = ref(storage, `userFiles/${userAuth.username}/${fileName}`);
                try {
                    await uploadBytes(storageRef, state.file);
                    fileURL = await getDownloadURL(storageRef);
                } catch (error) {
                    throw new Error("No se pudo subir el archivo.");
                }
            }

            const dataToSave = {
                [isIncome ? "ingreso" : "gasto"]: value,
                title: state.title,
                remarks: state.remarks,
                type: state.type,
                category: state.category,
                user: userAuth.username,
                createdAt: date,
                year: yearString,
                period: period,
            };

            if (fileURL) {
                dataToSave.image = {
                    imageURL: fileURL,
                    name: fileName || state.file?.name || "",
                };
            }

            const collectionName = isIncome ? "ingresos" : "gastos";

            if (state.currentId) {
                const docRef = doc(db, "userPosts", userAuth.username, collectionName, String(state.currentId));
                await updateDoc(docRef, dataToSave);
            } else {
                const colRef = collection(db, "userPosts", userAuth.username, collectionName);
                await addDoc(colRef, dataToSave);
            }

            setState((prev) => ({
                ...prev,
                [isIncome ? "ingreso" : "gasto"]: "",
                title: "",
                remarks: "",
                category: "",
                type: "",
                file: null,
                isModalOpen: false,
                error: "",
                currentId: null,
            }));

            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            console.error(`Error al guardar el ${isIncome ? "ingreso" : "gasto"}: `, error);
            setState((prev) => ({ ...prev, error: `Error al guardar los datos: ${error.message}`, isSubmitting: false }));
        } finally {
            setState((prev) => ({ ...prev, isSubmitting: false }));
        }
    };

    // Agrupar Gastos por categoría
    const groupedByCategoryExpense = state.gastos.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = 0;
        }
        acc[item.category] += parseFloat(item.gasto) || 0;
        return acc;
    }, {});

    // Agrupar por tipo de pago
    const groupedByPaymentType = state.gastos.reduce((acc, item) => {
        if (!acc[item.type]) {
            acc[item.type] = 0;
        }
        acc[item.type] += parseFloat(item.gasto) || 0;
        return acc;
    }, {});

    // Extraer las categorías y los valores para cada gráfico de Gastos
    const categoryLabelsExpense = Object.keys(groupedByCategoryExpense);
    const categoryValuesExpense = Object.values(groupedByCategoryExpense);

    // Extraer los tipos de pago y los valores para cada gráfico
    const paymentLabels = Object.keys(groupedByPaymentType);
    const paymentValues = Object.values(groupedByPaymentType);

    // Preparar los datos para los gráficos de pastel de Gastos
    const categoryChartDataExpense = {
        labels: categoryLabelsExpense,
        datasets: [
            {
                label: 'Gastos por Categoría',
                data: categoryValuesExpense,
                backgroundColor: ['#C2185B', '#00A86B', '#580d71', '#EF5350', '#7c90bc'],
                borderColor: '#fff',
                borderWidth: 1,
            }
        ],
    };

    const paymentChartData = {
        labels: paymentLabels,
        datasets: [
            {
                label: 'Gastos por Tipo de Pago',
                data: paymentValues,
                backgroundColor: ['#C2185B', '#00A86B', '#580d71', '#EF5350', '#7c90bc'],
                borderColor: '#fff',
                borderWidth: 1,
            }
        ],
    };

    // Agrupar Ingresos por categoría
    const groupedByCategoryIncome = state.ingresos.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = 0;
        }
        acc[item.category] += parseFloat(item.ingreso) || 0;
        return acc;
    }, {});
    const categoryLabelsIncome = Object.keys(groupedByCategoryIncome);
    const categoryValuesIncome = Object.values(groupedByCategoryIncome);

    const totalBudget = !loading && userData && userData.expenseControl && userData.expenseControl.budget
    const totalBudgetToSpent = !loading && userData && userData.expenseControl && userData.expenseControl.budget - totalGastos
    const percentSpent = totalBudgetToSpent * 100 / totalBudget
    const percentFree = totalGastos * 100 / totalBudget

    if (state.loading) {
        return <Spinner />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            {/* Sección de Gastos Totales */}
            <section className="w-full max-w-screen-sm mt-6 py-3 flex flex-col items-center">
                <p className="leading-3 text-main-dark/50">Gastos Totales</p>
                <h1 className="text-4xl font-bold text-main-dark my-1">${totalGastos.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                <p className={` ${totalBudget - totalGastos < 0 ? 'text-main-primary' : 'text-main-highlight'}`}>
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalBudget - totalGastos.toFixed(2))}
                </p>
            </section>

            {/* Botones para Agregar Gastos */}
            <section className="w-full max-w-screen-sm flex justify-between items-center gap-2 py-3">
                <button
                    onClick={() => {
                        setIsIncome(false); // Es un gasto
                        openModal();
                    }}
                    className="w-full flex-center gap-1 text-sm font-semibold bg-main-primary/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary"
                >
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.plus.fill("#FFFFFF")}</i>
                    Agregar Gasto
                </button>

                <button
                    onClick={() => {
                        setIsIncome(true); // Es un ingreso
                        openModal();
                    }}
                    className="w-full flex-center gap-1 text-sm font-semibold bg-main-highlight/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-highlight"
                >
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.plus.fill("#FFFFFF")}</i>
                    Agregar Ingreso
                </button>
            </section>

            {/* <section className="w-full max-w-screen-sm py-3">
                <h2 className="text-dark text-lg font-semibold mb-4">Notificaciones</h2>
                <div className="bg-main-warning rounded-3xl p-4">
                    <p className="text-dark font-medium">¡Alerta! Has superado tu presupuesto mensual en un 75.05%.</p>
                </div>
            </section> */}

            {filteredGastos.length > 0 &&
                <section className="w-full max-w-screen-sm py-3">
                    <h2 className="text-main-dark text-lg font-semibold mb-4">Resumen Mensual</h2>

                    <aside className="w-full flex flex-wrap items-start gap-[4%]">
                        <div className="w-[48%] max-w-[300px] aspect-square mb-4">
                            <div className="bg-main-dark/5 p-4 rounded-3xl h-full flex flex-col items-start">
                                <div className="flex-grow flex-center w-full pr-12">
                                    <Pie
                                        data={categoryChartDataExpense}
                                        options={{
                                            cutout: '75%',
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        label: (tooltipItem) => {
                                                            return `${categoryLabelsExpense[tooltipItem.dataIndex]}: $${categoryValuesExpense[tooltipItem.dataIndex].toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                                        }
                                                    }
                                                },
                                                legend: {
                                                    display: false,
                                                }
                                            }
                                        }}
                                    />
                                    <span className={`absolute m-auto font-bold text-xl ${percentFree > 100 && 'text-main-primary'}`}>{` ${percentFree.toFixed(0)}% `}</span>
                                </div>
                                <p className="text-main-dark text-center sm:text-left flex flex-col items-start font-light uppercase text-xs mt-2">
                                    Gastos por<span className="font-semibold text-base text-main-primary">Categoría</span>
                                </p>
                            </div>
                        </div>

                        {/* Total por Categoría */}
                        <div className="w-[48%] max-w-[300px] aspect-square">
                            <div className="bg-main-dark/5 p-4 rounded-3xl h-full flex items-center">
                                <div className="space-y-1 w-full">
                                    {categoryLabelsExpense.map((category, index) => (
                                        <div key={category} className="flex justify-between items-center border-b border-main-dark/20">
                                            <span className="text-xs font-light capitalize text-main-dark" style={{ color: categoryChartDataExpense.datasets[0].backgroundColor[index] }}>
                                                {
                                                    category == 'feeding' && 'Alimentación y Bebidas' ||
                                                    category == 'transportation' && 'Transporte' ||
                                                    category == 'personalCare' && 'Ropa y Cuidado Personal' ||
                                                    category == 'entertainment' && 'Entretenimiento y Ocio' ||
                                                    category == 'housing' && 'Vivienda' ||
                                                    category == 'health' && 'Salud y Bienestear' ||
                                                    category
                                                }
                                            </span>
                                            <span className="text-sm text-main-highlight" style={{ color: paymentChartData.datasets[0].backgroundColor[index] }}>
                                                ${categoryValuesExpense[index].toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <aside className="w-full flex flex-wrap items-start gap-[4%]">
                        {paymentLabels.map((paymentType, index) => (
                            <div key={paymentType} className="w-[48%] max-w-[300px] h-20 mb-4">
                                <div className="bg-main-dark/5 py-2 px-4 rounded-3xl h-full flex flex-col items-start">
                                    {/* Tarjeta con el total de cada tipo de pago */}
                                    <div className="flex-grow flex gap-4 w-full">
                                        <p className="flex flex-col items-start w-full py-1">
                                            <span
                                                className="text-xs font-light capitalize text-main-dark"
                                                style={{ color: paymentChartData.datasets[0].backgroundColor[index] }}
                                            >
                                                {paymentType === 'card1' && userData.paymentTypes.card1}
                                                {paymentType === 'card2' && userData.paymentTypes.card2}
                                                {paymentType === 'card3' && userData.paymentTypes.card3}
                                                {paymentType === 'card4' && userData.paymentTypes.card4}
                                                {paymentType === 'card5' && userData.paymentTypes.card5}
                                                {paymentType === 'other' && userData.paymentTypes.other}
                                                {paymentType === 'cash' && 'Efectivo'}
                                            </span>
                                            <span
                                                className="text-xl font-semibold text-main-dark"
                                            //style={{ color: paymentChartData.datasets[0].backgroundColor[index] }}
                                            >
                                                ${paymentValues[index].toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </p>
                                        <i className="flex-center w-9 h-9">
                                            {
                                                paymentType === 'cash' && ICONS.money.border(paymentChartData.datasets[0].backgroundColor[index]) ||
                                                paymentType === 'other' && ICONS.bitcoin.border(paymentChartData.datasets[0].backgroundColor[index]) ||
                                                ICONS.credit_card.border(paymentChartData.datasets[0].backgroundColor[index])
                                            }
                                        </i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </aside>

                    <aside className="w-full flex flex-wrap items-stretch gap-[4%]">
                        <div className={`flex flex-col bg-main-dark/5 rounded-3xl p-4 ${percentSpent < 0 ? ' items-start w-[48%] max-w-[300px]' : ' w-[48%] max-w-[300px] h-20'}`}>
                            <span className="font-light text-xs text-main-dark">Presupuesto Libre</span>
                            <span className="font-semibold text-xl text-main-dark"> {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalBudget - totalGastos)}
                            </span>
                        </div>
                        <div className={`flex flex-col bg-main-dark/5 rounded-3xl p-4 ${percentSpent < 0 ? ' items-start w-[48%] max-w-[300px]' : ' w-[48%] max-w-[300px] h-20'}`}>
                            <span className="font-light text-xs text-main-dark">Gastos Totales</span>
                            <span className="font-semibold text-xl text-main-dark">${totalGastos.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </aside>

                    <aside className="w-full flex flex-wrap items-stretch gap-[4%] my-4">
                        <div className={`${(totalBudgetToSpent) < 0 ? 'bg-main-dark/20' : 'bg-main-dark/5 hidden'} ${percentSpent < 0 ? 'w-[48%] max-w-[300px]' : 'w-full'} bg-main-dark/20 rounded-3xl p-4 flex justify-between items-center`}>
                            <span className="text-main-dark">Saldo</span>
                            <span className={`${totalBudgetToSpent < 0 ? 'text-main-primary' : 'text-main-highlight'} font-semibold`}>
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalBudgetToSpent)}
                            </span>
                        </div>

                        {percentSpent < 0 &&
                            <div className="w-[48%] max-w-[300px] bg-main-primary/20 rounded-3xl p-4 flex items-center justify-between gap-1
                    opacity-0 transform scale-95 transition-all duration-500 ease-out motion-safe:animate-fade-in">
                                <i className="flex-center w-6 h-6">{ICONS.alert.border("#C2185B")}</i>
                                <span className="text-sm text-main-primary">
                                    Has gastado
                                    <span className="text-base font-semibold text-main-primary">
                                        {` ${percentSpent.toFixed(2)}% `}
                                    </span>
                                    más de lo que deberías este mes.
                                </span>
                            </div>
                        }
                    </aside>

                    <aside className="w-full aspect-auto mb-16">
                        <div className="w-full bg-main-dark/5 p-4 rounded-3xl h-full flex flex-col items-start">
                            <div className="w-full flex-grow flex justify-center">
                                <Line
                                    data={{
                                        labels: categoryLabelsIncome, // Usar categoryLabelsIncome directamente
                                        datasets: [{
                                            label: 'Ingresos por Categoría',
                                            data: categoryValuesIncome, // Usar categoryValuesIncome directamente
                                            borderColor: '#00A86B', // Color de la línea
                                            backgroundColor: 'rgba(77, 143, 246, 0.2)', // Color de fondo de la línea
                                            fill: true, // Rellenar el área debajo de la línea
                                            tension: 0.4, // Suavizado de la línea
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: (tooltipItem) => {
                                                        return `${categoryLabelsIncome[tooltipItem.dataIndex]}: $${categoryValuesIncome[tooltipItem.dataIndex].toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                                    }
                                                }
                                            },
                                            legend: {
                                                display: false, // No mostrar leyenda
                                            }
                                        },
                                        scales: {
                                            x: {
                                                grid: {
                                                    display: false, // No mostrar líneas de la cuadrícula en el eje X
                                                }
                                            },
                                            y: {
                                                ticks: {
                                                    callback: function (value) {
                                                        return `$${value.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />

                            </div>
                            <p className="text-main-dark text-center sm:text-left flex flex-col items-start font-light uppercase text-xs mt-2">
                                Ingresos <span className="font-semibold text-base text-main-primary">Totales</span>
                            </p>
                        </div>
                    </aside>
                </section>
            }

            {/* Sección de Últimos Gastos */}
            {/* {filteredGastos.length > 0 &&
                <section className="w-full max-w-screen-sm py-3 mb-20">
                    <h2 className="text-main-dark text-lg font-semibold mb-4">Últimos Gastos</h2>
                    <ul className="space-y-3">
                        {state.loading ? (
                            <Spinner bgTheme={true} />
                        ) : filteredGastos.length > 0 ? (
                            filteredGastos
                                .sort((a, b) => {
                                    const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
                                    const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
                                    return dateB.getTime() - dateA.getTime(); // Ordenar por fecha descendente
                                })
                                .slice(0, 6) // Mostrar los primeros 6
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
                                ))
                        ) : (
                            <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                                <span className="text-main-dark font-medium">No hay gastos registrados</span>
                            </li>
                        )}
                    </ul>
                </section>} */}

            {
                state.isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex-center z-50">
                        <div className="bg-white rounded-lg max-w-lg w-full h-[85vh] relative overflow-hidden">
                            <form onSubmit={(e) => handleSubmit(e, isIncome)} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <button onClick={closeModal} className="p-2 text-main-primary">Cancelar</button>

                                    <button
                                        type="submit"
                                        disabled={state.isSubmitting}
                                        className="p-2 text-main-highlight rounded hover:bg-main-primary-dark transition"
                                    >
                                        {state.isSubmitting ? "Guardando..." : (state.currentGastoId ? "Actualizar" : "Agregar")}
                                    </button>
                                </div>

                                <div className="px-2">
                                    <hgroup className="rounded-3xl py-2 px-4 mb-4 bg-main-light">
                                        <input
                                            name="title"
                                            type="text"
                                            placeholder={isIncome ? "Concepto del ingreso" : "Concepto del gasto"}
                                            value={state.title}
                                            onChange={handleChange}
                                            className="w-full py-2 bg-transparent outline-none border-b border-main-dark/20 text-main-dark placeholder:text-main-dark/50"
                                            required
                                        />
                                        <div className="flex-center pt-2 py-2">
                                            $
                                            <input
                                                name={isIncome ? "ingreso" : "gasto"}
                                                type="text" // Mantener como texto para manejar el formato
                                                placeholder={`$ $ ${isIncome ? "Ingreso" : "Gasto"}`}
                                                value={state[isIncome ? "ingreso" : "gasto"]}
                                                onChange={handleChange}
                                                onBlur={handleBlur} // Formato al perder el foco
                                                className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                                required
                                            />
                                            {!loading && userData && userData.expenseControl && userData?.expenseControl.currency}
                                        </div>
                                    </hgroup>


                                    <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                        <select name="type" value={state.type} onChange={handleChange} className="w-full bg-transparent outline-none" required>
                                            {isIncome ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <>
                                                    <option value="" hidden className="text-main-gray">Pago con</option>
                                                    {userData.paymentTypes.card1 &&
                                                        <option value={"card1"}>{userData.paymentTypes.card1}</option>}
                                                    {userData.paymentTypes.card2 &&
                                                        <option value={"card2"}>{userData.paymentTypes.card2}</option>
                                                    }
                                                    {userData.paymentTypes.card3 &&
                                                        <option value={"card3"}>{userData.paymentTypes.card3}</option>
                                                    }
                                                    {userData.paymentTypes.card4 &&
                                                        <option value={"card4"}>{userData.paymentTypes.card4}</option>
                                                    }
                                                    {userData.paymentTypes.card5 &&
                                                        <option value={"card5"}>{userData.paymentTypes.card5}</option>
                                                    }
                                                    {userData.paymentTypes.other &&
                                                        <option value={"other"}>{userData.paymentTypes.other}</option>
                                                    }
                                                    <option value={"cash"}>Efectivo</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                        <select name="category" value={state.category} onChange={handleChange} className="w-full bg-transparent outline-none" required>
                                            <option value="" hidden className="text-main-gray">Categorías</option>
                                            {isIncome ? (
                                                <>
                                                    <option value={"salary"}>Salario</option>
                                                    <option value={"business"}>Negocios</option>
                                                    <option value={"investment"}>Inversiones</option>
                                                    <option value={"other"}>Otros Ingresos</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value={"feeding"}>Alimentación y Bebidas</option>
                                                    <option value={"transportation"}>Transporte</option>
                                                    <option value={"health"}>Salud y Bienestar</option>
                                                    <option value={"educationJob"}>Gastos de Educación o Trabajo</option>
                                                    <option value={"housing"}>Vivienda</option>
                                                    <option value={"entertainment"}>Entretenimiento y Ocio</option>
                                                    <option value={"personalCare"}>Ropa y Cuidado Personal</option>
                                                </>
                                            )}
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

                                    {!state.currentGastoId &&
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
        </div>
    )
}