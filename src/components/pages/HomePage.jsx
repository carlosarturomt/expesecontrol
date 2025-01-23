import { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import { UserDataContext } from "@context/userDataContext";
import useAuthRequired from "@hooks/useAuthRequired";
import { Spinner } from "@components/atoms/Spinner";

import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,    // Para gráficas de tipo Pie
    Tooltip,       // Para mostrar los tooltips en las gráficas
    Legend,        // Para mostrar la leyenda
    CategoryScale, // Para trabajar con escalas de categorías
    LinearScale,   // Para trabajar con escalas lineales
    PointElement,  // Para mostrar puntos en gráficas lineales
    LineElement,   // Para gráficas de líneas
    Title,         // Para mostrar el título de la gráfica
    BarElement     // Para gráficas de barras
} from 'chart.js';

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
    BarElement // Registra el BarElement
);

/* assets */
import { x_male_female_purple } from "@assets/imgs/avatars";
import { ICONS } from "@assets/icons";

export default function HomePage() {
    const { isAuthenticated } = useAuthRequired("/register", "/");
    const { loading, userAuth, userData, state, setState } = useContext(UserDataContext);
    const [totalGastos, setTotalGastos] = useState(0);
    const [filteredGastos, setFilteredGastos] = useState([]);
    const [filteredPaymentValues, setFilteredPaymentValues] = useState([]);
    const [filteredPaymentLabels, setFilteredPaymentLabels] = useState([]);
    const [filteredPaymentChartData, setFilteredPaymentChartData] = useState([]);

    const [totalIncomes, setTotalIncomes] = useState(0);
    const [categoryIncomeChartData, setCategoryIncomeChartData] = useState({});

    const [categoryExpenseChartData, setCategoryExpenseChartData] = useState({});

    const [isIncome, setIsIncome] = useState(false);

    const selectedAvatar = userData && userData?.profilePhoto || "";
    const location = useLocation().pathname

    useEffect(() => {
        if (!userData || !state.gastos || !state.ingresos || loading) return;

        const cutoffDay = parseInt(userData?.expenseControl?.cutoffDay, 10) || 12;
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Calcular el rango de fechas
        const startDate = new Date(currentYear, currentMonth - (currentDay < cutoffDay ? 1 : 0), cutoffDay);

        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, cutoffDay - 1, 23, 59, 59);

        // Filtrar los gastos
        const gastosFiltrados = state.gastos.filter((gasto) => {
            const gastoDate = gasto.createdAt instanceof Date ? gasto.createdAt : gasto.createdAt.toDate();
            return gastoDate >= startDate && gastoDate <= endDate;
        });

        // Agrupar los gastos por tipo de pago
        const groupedByPaymentType = gastosFiltrados.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = 0;
            }
            acc[item.type] += parseFloat(item.gasto) || 0;
            return acc;
        }, {});

        // Agrupar los gastos por categoría
        const groupedByCategoryExpense = gastosFiltrados.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = 0;
            acc[item.category] += parseFloat(item.gasto) || 0;
            return acc;
        }, {});

        // Preparar datos para los gráficos
        const paymentLabels = Object.keys(groupedByPaymentType);
        const paymentValues = Object.values(groupedByPaymentType);

        const categoryLabelsExpense = Object.keys(groupedByCategoryExpense);
        const categoryValuesExpense = Object.values(groupedByCategoryExpense);

        // Configurar datos del gráfico de tipo de pago
        const paymentChartData = {
            labels: paymentLabels,
            datasets: [
                {
                    label: 'Gastos por Tipo de Pago',
                    data: paymentValues,
                    backgroundColor: ['#495867', '#495867', '#495867', '#495867', '#495867'],
                    borderColor: '#fff',
                    borderWidth: 1,
                }
            ],
        };

        // Actualizar estados para gráficos de gasto
        setFilteredPaymentValues(paymentValues);
        setFilteredPaymentLabels(paymentLabels);
        setFilteredPaymentChartData(paymentChartData);
        setFilteredGastos(gastosFiltrados);

        setTotalGastos(gastosFiltrados.reduce(
            (acc, gasto) => acc + (parseFloat(gasto.gasto) || 0),
            0
        ));

        setCategoryExpenseChartData({
            labels: categoryLabelsExpense,
            datasets: [
                {
                    label: 'Gastos por Categoría',
                    data: categoryValuesExpense,
                    backgroundColor: ['#D3D6DB', '#D3D6DB', '#D3D6DB', '#D3D6DB', '#D3D6DB'],
                    borderColor: '#fff',
                    borderWidth: 1,
                },
            ],
        });

        // Datos para el gráfico de ingresos
        const groupedByCategoryIncome = state.ingresos.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = 0;
            acc[item.category] += parseFloat(item.ingreso) || 0;
            return acc;
        }, {});

        const categoryLabelsIncome = Object.keys(groupedByCategoryIncome);
        const categoryValuesIncome = Object.values(groupedByCategoryIncome);

        setCategoryIncomeChartData({
            labels: categoryLabelsIncome,
            datasets: [{
                label: 'Ingresos por Categoría',
                data: categoryValuesIncome,
                backgroundColor: ['#D3D6DB', '#D3D6DB', '#D3D6DB', '#D3D6DB', '#D3D6DB'],
                borderColor: '#fff',
                borderWidth: 1,
            }]
        });

        const incomesFiltered = state.ingresos.filter((income) => {
            const incomeDate = income.createdAt instanceof Date ? income.createdAt : income.createdAt.toDate();

            return incomeDate >= startDate && incomeDate <= endDate;
        });

        setTotalIncomes(incomesFiltered.reduce(
            (acc, income) => acc + (parseFloat(income.ingreso) || 0),
            0
        ));
    }, [state.gastos, state.ingresos, userData, loading]);

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

    useEffect(() => {
        if (userAuth && userAuth.username) {
            const gastosRef = collection(db, "userPosts", userAuth.username, "gastos");
            const ingresosRef = collection(db, "userPosts", userAuth.username, "ingresos");

            // Suscripción en tiempo real a los gastos
            const unsubscribeGastos = onSnapshot(gastosRef, (snapshot) => {
                const gastosList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(),
                }));

                setState((prev) => ({
                    ...prev,
                    gastos: gastosList,
                    loading: false,
                }));
            });

            // Suscripción en tiempo real a los ingresos
            const unsubscribeIngresos = onSnapshot(ingresosRef, (snapshot) => {
                const ingresosList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(),
                }));

                setState((prev) => ({
                    ...prev,
                    ingresos: ingresosList,
                    loading: false,
                }));
            });

            // Limpiar las suscripciones cuando el componente se desmonte
            return () => {
                unsubscribeGastos();
                unsubscribeIngresos();
            };
        }
    }, [userAuth]);

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
            const formattedValue = (name === "gasto" || name === "ingreso") ? formatCurrency(value) : value;

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
            //setTimeout(() => location.reload(), 1000);
        } catch (error) {
            console.error(`Error al guardar el ${isIncome ? "ingreso" : "gasto"}: `, error);
            setState((prev) => ({ ...prev, error: `Error al guardar los datos: ${error.message}`, isSubmitting: false }));
        } finally {
            setState((prev) => ({ ...prev, isSubmitting: false }));
        }
    };

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
        <div className="mb-10">
            {/* Header */}
            <section className="w-full max-w-screen-sm flex items-center justify-end"
            >
                <NavLink to={!location.includes('profile') && 'profile'}
                >
                    {/* <i className="flex-center w-10 h-10 aspect-square rounded-full p-1 bg-primary-nightshade/70">{ICONS.user.border("#F5F6FA")}</i> */}
                    <img
                        src={selectedAvatar || x_male_female_purple}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border"
                    />
                </NavLink>
            </section>

            {/* Sección de Gastos Totales */}
            <section className="w-full max-w-screen-sm py-3 flex flex-col items-center">
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
                    className="w-full flex-center gap-1 text-sm font-semibold bg-primary-nightshade/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-primary-nightshade"
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

            {filteredGastos.length > 0 &&
                <section className="w-full max-w-screen-sm py-3">
                    <h2 className="text-main-dark text-lg font-semibold mb-3">Resumen Mensual</h2>

                    <NavLink to="/expenses/all" className="w-full flex gap-[4%] h-full rounded-3xl mb-3 bg-white">
                        {/* Primer div con el texto */}
                        <div className="w-[48%] h-[130px] py-3 px-4 flex flex-col justify-between">
                            <p className="w-full text-main-primary text-center flex gap-1 font-bold">
                                <i className="flex-center w-5 h-5 aspect-square">{ICONS.flame.fill("#C2185B")}</i>
                                Gastos
                            </p>
                            <p className={`w-full font-semibold text-2xl mt-7 ${percentFree > 100 && 'text-primary-nightshade'}`}>
                                {` ${percentFree.toFixed(0)}% `}
                                {/* ${totalGastos.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
                                <span className="text-xs ml-1 text-primary-slate/70">gastado</span>
                            </p>
                        </div>

                        <div className="w-[48%] h-[130px] max-h-[130px] p-4 rounded-3xl flex flex-col items-start">
                            <div className="flex-grow flex-center w-full h-full pl-12">
                                <Pie
                                    data={categoryExpenseChartData}
                                    options={{
                                        cutout: '55%',
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: (tooltipItem) => {
                                                        return `${categoryExpenseChartData.labels[tooltipItem.dataIndex]}: $${categoryExpenseChartData.datasets[0].data[tooltipItem.dataIndex].toLocaleString("es-MX", {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`;
                                                    },
                                                },
                                            },
                                            legend: {
                                                display: false,
                                                //display: true, // Mostrar leyenda para categorías
                                                //position: 'bottom',
                                            },
                                        },
                                    }}
                                />
                                {/* <span className="flex-center absolute mx-auto text-primary-slate">
                                    {percentFree.toFixed(0)}%
                                </span> */}
                            </div>
                        </div>
                    </NavLink>

                    <NavLink to="/incomes" className="w-full flex gap-[4%] h-full rounded-3xl mb-3 bg-white">
                        {/* Primer div con el texto */}
                        <div className="w-[48%] h-[130px] py-3 px-4 flex flex-col justify-between">
                            <p className="w-full text-main-highlight/70 text-center flex gap-1 font-bold">
                                <i className="flex-center w-6 h-6">{ICONS.money.wings()}</i>
                                Ingresos
                            </p>
                            <p className={`w-full font-semibold text-2xl mt-7`}>
                                {`$${totalIncomes.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                <span className="text-xs text-primary-slate/70"> ganados</span>
                            </p>
                        </div>

                        <div className="w-[48%] h-[130px] max-h-[130px] p-4 rounded-3xl flex flex-col items-start">
                            <div className="flex-grow flex-center w-full h-full pl-12">
                                <Pie
                                    data={categoryIncomeChartData}
                                    options={{
                                        cutout: '55%',
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: (tooltipItem) => {
                                                        return `${categoryIncomeChartData.labels[tooltipItem.dataIndex]}: $${categoryIncomeChartData.datasets[0].data[tooltipItem.dataIndex].toLocaleString("es-MX", {
                                                            style: "decimal",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`;
                                                    },
                                                },
                                            },
                                            legend: {
                                                display: false, // Mostrar leyenda para categorías
                                                //display: true, // Mostrar leyenda para categorías
                                                //position: 'bottom',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </NavLink>

                    <aside className="w-full flex flex-wrap items-stretch gap-[4%]">
                        <div className={`flex flex-col bg-white rounded-3xl py-3 px-4 ${percentSpent < 0 ? ' hidden ' : ' w-[48%] max-w-[300px]'}`}>
                            <span className="font-light text-xs text-primary-slate">Presupuesto Libre</span>

                            <span className="font-semibold text-xl text-main-dark"> {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalBudget - totalGastos)}
                            </span>
                        </div>

                        <NavLink to="/expenses/gastos" className={`flex flex-col bg-white rounded-3xl py-3 px-4 ${percentSpent < 0 ? ' items-start w-full' : ' w-[48%] max-w-[300px]'}`}>
                            <span className="font-light text-xs text-primary-slate">Gastos Totales</span>
                            <span className="font-semibold text-xl text-main-dark">${totalGastos.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </NavLink>
                    </aside>

                    {totalBudgetToSpent < 0 &&
                        <aside className="w-full flex flex-wrap items-stretch gap-[4%] mt-3">
                            <div className={`${(totalBudgetToSpent) < 0 ? 'bg-primary-platinum' : 'bg-white hidden'} ${percentSpent < 0 ? 'w-[48%] max-w-[300px]' : 'w-full'} rounded-3xl p-4 flex justify-between items-center`}>
                                <span className="text-main-dark">Saldo</span>
                                <span className={`${totalBudgetToSpent < 0 ? 'text-main-primary' : 'text-main-highlight'} font-semibold`}>
                                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalBudgetToSpent)}
                                </span>
                            </div>

                            {percentSpent < 0 &&
                                <div className="w-[48%] max-w-[300px] bg-primary-platinum rounded-3xl p-4 flex items-center justify-between gap-1 opacity-0 transform scale-95 transition-all duration-500 ease-out motion-safe:animate-fade-in">
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
                    }

                    <aside className="w-full flex flex-wrap items-start gap-[4%] my-3">
                        {filteredPaymentLabels.map((paymentType, index) => (
                            <NavLink to="/expenses/payments" key={paymentType} className="w-[48%] max-w-[300px] mb-3">
                                <div className="bg-white py-3 px-4 rounded-3xl h-full flex flex-col items-start">
                                    {/* Tarjeta con el total de cada tipo de pago */}
                                    <div className="flex-grow flex gap-4 w-full">
                                        <p className="flex flex-col items-start w-full">
                                            <span
                                                className="text-xs font-light capitalize text-main-dark"
                                                style={{ color: filteredPaymentChartData.datasets[0].backgroundColor[index] }}
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
                                                ${filteredPaymentValues[index].toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </p>
                                        <i className="flex-center w-9 h-9">
                                            {
                                                paymentType === 'cash' && ICONS.money.border(filteredPaymentChartData.datasets[0].backgroundColor[index]) ||
                                                paymentType === 'other' && ICONS.bitcoin.border(filteredPaymentChartData.datasets[0].backgroundColor[index]) ||
                                                ICONS.credit_card.border(filteredPaymentChartData.datasets[0].backgroundColor[index])
                                            }
                                        </i>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </aside>
                </section>
            }

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
                                                    <option value={"educationJob"}>Educación o Trabajo</option>
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