import { useContext, useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import { UserDataContext } from "@context/userDataContext";
import useAuthRequired from "@hooks/useAuthRequired";
import { Spinner } from "@components/atoms/Spinner";
import { ICONS } from "@assets/icons";
import { SwipeableCard } from "../atoms/Button";

export default function HomePage() {
    const { isAuthenticated } = useAuthRequired("/register", "/");
    const { loading, userAuth, userData, state, setState } = useContext(UserDataContext);
    const [totalGastos, setTotalGastos] = useState(0);
    const [expandedGastoId, setExpandedGastoId] = useState(null);

    useEffect(() => {
        const total = state.gastos.reduce((acc, gasto) => acc + (parseFloat(gasto.gasto) || 0), 0);
        setTotalGastos(total);
    }, [state.gastos]);

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

    const handleCardClick = (id) => {
        setExpandedGastoId(expandedGastoId === id ? null : id);
    };

    const handleEdit = async (year, period, id) => {
        try {
            const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", year, period, id);
            const gastoSnap = await getDoc(gastoRef);

            if (gastoSnap.exists()) {
                const gastoData = gastoSnap.data();

                setState((prev) => ({
                    ...prev,
                    gasto: gastoData.gasto || '',
                    title: gastoData.title || '',
                    remarks: gastoData.remarks || '',
                    category: gastoData.category || '',
                    type: gastoData.type || '',
                    date: gastoData.createdAt
                        ? gastoData.createdAt.toDate().toISOString().substring(0, 10)  // Formato ISO para <input type="date">
                        : '',
                    fileURL: gastoData.fileURL || '',
                    isModalOpen: true,
                    currentGastoId: id,  // Guarda el ID del gasto actual
                }));

                setTimeout(() => location.reload(), 1000)
            } else {
                console.error("No se encontró el gasto para editar.");
            }
        } catch (error) {
            console.error("Error al obtener los datos del gasto:", error);
        }
    };

    const handleDelete = async (year, period, id) => {
        console.log(year, period, id);
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar el gasto con ID: ${id}?`);
        if (confirmDelete) {
            try {
                const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", year, period, id);
                await deleteDoc(gastoRef);
                console.log(`Gasto con ID: ${id} eliminado.`);
                setTimeout(() => location.reload(), 1000)
            } catch (error) {
                console.error("Error al eliminar el gasto: ", error);
            }
        }
    };

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

    /* const handleSubmit = async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, isSubmitting: true }));

        // Validar el valor del gasto
        const gastoValue = parseFloat((state.gasto || "").toString().replace(/[^0-9.-]+/g, ""));
        if (isNaN(gastoValue) || gastoValue <= 0) {
            setState(prev => ({ ...prev, error: "Por favor, ingresa un gasto válido.", isSubmitting: false }));
            return;
        }

        // Ajuste para la fecha
        const date = state.date ? new Date(state.date + 'T00:00:00') : new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const yearString = String(year);
        let period = ""; // Mueve esta línea aquí

        // Determinación del periodo
        if (day < 12) {
            // Si el día es menor a 12, consideramos el mes anterior
            switch (month) {
                case 0: // Enero
                    period = "diciembreEnero";
                    break;
                case 1: // Febrero
                    period = "eneroFebrero";
                    break;
                case 2: // Marzo
                    period = "febreroMarzo";
                    break;
                case 3: // Abril
                    period = "marzoAbril";
                    break;
                case 4: // Mayo
                    period = "abrilMayo";
                    break;
                case 5: // Junio
                    period = "mayoJunio";
                    break;
                case 6: // Julio
                    period = "junioJulio";
                    break;
                case 7: // Agosto
                    period = "julioAgosto";
                    break;
                case 8: // Septiembre
                    period = "agostoSeptiembre";
                    break;
                case 9: // Octubre
                    period = "septiembreOctubre";
                    break;
                case 10: // Noviembre
                    period = "octubreNoviembre";
                    break;
                case 11: // Diciembre
                    period = "noviembreDiciembre";
                    break;
                default:
                    period = "desconocido";
            }
        } else {
            // Si el día es 12 o mayor, consideramos el mes actual
            switch (month) {
                case 0:
                    period = "eneroFebrero";
                    break;
                case 1:
                    period = "febreroMarzo";
                    break;
                case 2:
                    period = "marzoAbril";
                    break;
                case 3:
                    period = "abrilMayo";
                    break;
                case 4:
                    period = "mayoJunio";
                    break;
                case 5:
                    period = "junioJulio";
                    break;
                case 6:
                    period = "julioAgosto";
                    break;
                case 7:
                    period = "agostoSeptiembre";
                    break;
                case 8:
                    period = "septiembreOctubre";
                    break;
                case 9:
                    period = "octubreNoviembre";
                    break;
                case 10:
                    period = "noviembreDiciembre";
                    break;
                case 11:
                    period = "diciembreEnero";
                    break;
                default:
                    period = "desconocido";
            }
        }

        try {
            let fileURL = state.fileURL; // Mantén la URL original del archivo si existe

            if (state.file) {  // Si se selecciona un archivo nuevo, sube ese archivo
                const timestamp = Date.now();
                const fileName = `${state.title}_${timestamp}.${state.file.name.split('.').pop()}`;
                const storageRef = ref(storage, `userFiles/${userAuth.username}/${fileName}`);

                await uploadBytes(storageRef, state.file);
                fileURL = await getDownloadURL(storageRef);
            }

            if (state.currentGastoId) {
                const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", yearString, period, String(state.currentGastoId));
                await updateDoc(gastoRef, {
                    gasto: gastoValue,
                    title: state.title,
                    remarks: state.remarks,
                    type: state.type,
                    category: state.category,
                    fileURL: fileURL,  // Usa la URL actualizada o la original
                    user: userAuth.username,
                    createdAt: date,
                    year: yearString,
                    period: period,
                });
            } else {
                const gastosRef = collection(db, "userPosts", userAuth.username, "gastos", yearString, period);
                await addDoc(gastosRef, {
                    gasto: gastoValue,
                    title: state.title,
                    remarks: state.remarks,
                    type: state.type,
                    category: state.category,
                    fileURL: fileURL,  // Usa la URL del archivo
                    user: userAuth.username,
                    createdAt: date,
                    year: yearString,
                    period: period,
                });
            }

            setState(prev => ({
                ...prev,
                gasto: "",
                title: "",
                remarks: "",
                category: "",
                type: "",
                file: null,
                isModalOpen: false,
                error: "",
                currentGastoId: null,
            }));
        } catch (error) {
            console.error("Error al subir datos: ", error);
            setState(prev => ({ ...prev, error: "Error al subir los datos: " + error.message, isSubmitting: false }));
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    }; */

    /* const handleSubmit = async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, isSubmitting: true }));

        // Validar el valor del gasto
        const gastoValue = parseFloat((state.gasto || "").toString().replace(/[^0-9.-]+/g, ""));
        if (isNaN(gastoValue) || gastoValue <= 0) {
            setState(prev => ({ ...prev, error: "Por favor, ingresa un gasto válido.", isSubmitting: false }));
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
        let period = ""; // Mueve esta línea aquí

        // Determinación del periodo
        if (day < userCutoffDay) {
            // Si el día es menor que el día de corte, consideramos el mes anterior
            switch (month) {
                case 0: // Enero
                    period = "diciembreEnero";
                    break;
                case 1: // Febrero
                    period = "eneroFebrero";
                    break;
                case 2: // Marzo
                    period = "febreroMarzo";
                    break;
                case 3: // Abril
                    period = "marzoAbril";
                    break;
                case 4: // Mayo
                    period = "abrilMayo";
                    break;
                case 5: // Junio
                    period = "mayoJunio";
                    break;
                case 6: // Julio
                    period = "junioJulio";
                    break;
                case 7: // Agosto
                    period = "julioAgosto";
                    break;
                case 8: // Septiembre
                    period = "agostoSeptiembre";
                    break;
                case 9: // Octubre
                    period = "septiembreOctubre";
                    break;
                case 10: // Noviembre
                    period = "octubreNoviembre";
                    break;
                case 11: // Diciembre
                    period = "noviembreDiciembre";
                    break;
                default:
                    period = "desconocido";
            }
        } else {
            // Si el día es igual o mayor que el día de corte, consideramos el mes actual
            switch (month) {
                case 0:
                    period = "eneroFebrero";
                    break;
                case 1:
                    period = "febreroMarzo";
                    break;
                case 2:
                    period = "marzoAbril";
                    break;
                case 3:
                    period = "abrilMayo";
                    break;
                case 4:
                    period = "mayoJunio";
                    break;
                case 5:
                    period = "junioJulio";
                    break;
                case 6:
                    period = "julioAgosto";
                    break;
                case 7:
                    period = "agostoSeptiembre";
                    break;
                case 8:
                    period = "septiembreOctubre";
                    break;
                case 9:
                    period = "octubreNoviembre";
                    break;
                case 10:
                    period = "noviembreDiciembre";
                    break;
                case 11:
                    period = "diciembreEnero";
                    break;
                default:
                    period = "desconocido";
            }
        }

        // Continuación del manejo del archivo y la base de datos
        try {
            let fileURL = state.fileURL; // Mantén la URL original del archivo si existe

            if (state.file) {  // Si se selecciona un archivo nuevo, sube ese archivo
                const timestamp = Date.now();
                const fileName = `${state.title}_${timestamp}.${state.file.name.split('.').pop()}`;
                const storageRef = ref(storage, `userFiles/${userAuth.username}/${fileName}`);

                await uploadBytes(storageRef, state.file);
                fileURL = await getDownloadURL(storageRef);
            }

            if (state.currentGastoId) {
                const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", yearString, period, String(state.currentGastoId));
                await updateDoc(gastoRef, {
                    gasto: gastoValue,
                    title: state.title,
                    remarks: state.remarks,
                    type: state.type,
                    category: state.category,
                    fileURL: fileURL,  // Usa la URL actualizada o la original
                    user: userAuth.username,
                    createdAt: date,
                    year: yearString,
                    period: period,
                });
            } else {
                const gastosRef = collection(db, "userPosts", userAuth.username, "gastos", yearString, period);
                await addDoc(gastosRef, {
                    gasto: gastoValue,
                    title: state.title,
                    remarks: state.remarks,
                    type: state.type,
                    category: state.category,
                    fileURL: fileURL,  // Usa la URL del archivo
                    user: userAuth.username,
                    createdAt: date,
                    year: yearString,
                    period: period,
                });
            }

            setState(prev => ({
                ...prev,
                gasto: "",
                title: "",
                remarks: "",
                category: "",
                type: "",
                file: null,
                isModalOpen: false,
                error: "",
                currentGastoId: null,
            }));
        } catch (error) {
            console.error("Error al subir datos: ", error);
            setState(prev => ({ ...prev, error: "Error al subir los datos: " + error.message, isSubmitting: false }));
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    }; */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState(prev => ({ ...prev, isSubmitting: true }));

        // Validar el valor del gasto
        const gastoValue = parseFloat((state.gasto || "").toString().replace(/[^0-9.-]+/g, ""));
        if (isNaN(gastoValue) || gastoValue <= 0) {
            setState(prev => ({ ...prev, error: "Por favor, ingresa un gasto válido.", isSubmitting: false }));
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
                gasto: gastoValue,
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

            if (state.currentGastoId) {
                const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", yearString, period, String(state.currentGastoId));
                await updateDoc(gastoRef, dataToSave);
            } else {
                const gastosRef = collection(db, "userPosts", userAuth.username, "gastos", yearString, period);
                await addDoc(gastosRef, dataToSave);
            }

            // Limpiar el estado después de la operación
            setState(prev => ({
                ...prev,
                gasto: "",
                title: "",
                remarks: "",
                category: "",
                type: "",
                file: null,
                isModalOpen: false,
                error: "",
                currentGastoId: null,
            }));

            setTimeout(() => location.reload(), 1000)
        } catch (error) {
            console.error("Error al subir datos: ", error);
            setState(prev => ({ ...prev, error: "Error al subir los datos: " + error.message, isSubmitting: false }));
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    };


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
                <p className="text-main-dark/50">Gastos Totales</p>
                <h1 className="text-4xl font-bold text-main-dark my-2">${totalGastos.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                <p className={`${!loading && userData && userData.expenseControl && userData.expenseControl.budget - totalGastos < 0 ? 'text-main-primary' : 'text-main-highlight'}`}>
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(!loading && userData && userData.expenseControl && userData.expenseControl.budget - totalGastos.toFixed(2))}
                </p>
            </section>

            {/* Botones para Agregar Gastos */}
            <section className="w-full max-w-screen-sm flex justify-between items-center gap-2 py-3 px-6">
                <button onClick={openModal} className="w-full flex-center gap-1 text-sm font-semibold bg-main-highlight/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark">
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.plus.fill("#FFFFFF")}</i>
                    Agregar Gasto
                </button>
            </section>

            {/* <section className="w-full max-w-screen-sm py-3">
                <h2 className="text-dark text-lg font-semibold mb-4">Notificaciones</h2>
                <div className="bg-main-warning rounded-3xl p-4">
                    <p className="text-dark font-medium">¡Alerta! Has superado tu presupuesto mensual en un 75.05%.</p>
                </div>
            </section> */}

            <section className="w-full max-w-screen-sm py-3">
                <h2 className="text-main-dark text-lg font-semibold mb-4">Resumen Mensual</h2>
                <div className="bg-main-dark/5 rounded-3xl p-4 flex justify-between items-center">
                    <span className="text-main-dark">Presupuesto</span>
                    <span className="text-main-dark font-semibold"> {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(!loading && userData && userData.expenseControl && userData.expenseControl.budget)}
                    </span>
                </div>
                <div className="bg-main-dark/5 rounded-3xl p-4 flex justify-between items-center mt-2">
                    <span className="text-main-dark">Gastos Totales</span>
                    <span className="text-main-dark font-semibold">${totalGastos.toLocaleString("es-MX", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className={`${(!loading && userData && userData.expenseControl && userData.expenseControl.budget - totalGastos) < 0 ? 'bg-main-dark/20' : 'bg-main-highlight/40'} rounded-3xl p-4 flex justify-between items-center mt-2`}>
                    <span className="text-main-dark">Saldo Actual</span>
                    <span className={`${totalGastos < 0 ? 'text-main-primary' : 'text-main-primary'} font-semibold`}>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(!loading && userData && userData.expenseControl && userData.expenseControl.budget - totalGastos)}</span>
                </div>
                {/* <div className="bg-main-primary/20 rounded-3xl p-4 flex justify-between items-center mt-2">
                    <span className="text-main-primary font-semibold">Exceso</span>
                    <span className="text-main-primary font-semibold">- $7,505.00 (75.05%)</span>
                </div> */}
            </section>

            {/* Sección de Últimos Gastos */}
            <section className="w-full max-w-screen-sm py-3 mb-20">
                <h2 className="text-main-dark text-lg font-semibold mb-4">Últimos Gastos</h2>
                <ul className="space-y-3">
                    {state.loading ? (
                        <Spinner bgTheme={true} />
                    ) : state.gastos.length > 0 ? (
                        <ul className="space-y-3">
                            {state.gastos
                                .sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)
                                .map(gasto => {
                                    return (
                                        <SwipeableCard
                                            key={gasto.id}
                                            context={userData}
                                            data={gasto}
                                            onEdit={() => handleEdit(gasto.year, gasto.period, gasto.id)}
                                            onDelete={() => handleDelete(gasto.year, gasto.period, gasto.id)}
                                            expandedGastoId={expandedGastoId}
                                            onCardClick={handleCardClick}
                                        />
                                    )
                                })}
                        </ul>
                    ) : (
                        <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                            <span className="text-main-dark font-medium">No hay gastos registrados</span>
                        </li>
                    )}
                </ul>
            </section>

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
                                        {state.isSubmitting ? "Guardando..." : (state.currentGastoId ? "Actualizar" : "Agregar")}
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
                                                name="gasto"
                                                type="text" // Mantener como texto para manejar el formato
                                                placeholder="$ $"
                                                value={state.gasto}
                                                onChange={handleChange}
                                                onBlur={handleBlur} // Formato al perder el foco
                                                className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                                required
                                            />
                                            {!loading && userData && userData.expenseControl && userData?.expenseControl.currency}
                                        </div>
                                    </hgroup>

                                    <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                        <select name="type" value={state.type} onChange={handleChange} className="w-full bg-transparent outline-none">
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
                                        </select>
                                    </div>

                                    <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                        <select name="category" value={state.category} onChange={handleChange} className="w-full bg-transparent outline-none">
                                            <option value="" hidden className="text-main-gray">Categorías</option>
                                            <option value={"feeding"}>Alimentación y Bebidas</option>
                                            <option value={"transportation"}>Transporte</option>
                                            <option value={"health"}>Salud y Bienestar</option>
                                            <option value={"educationJob"}>Gastos de Educación o Trabajo</option>
                                            <option value={"housing"}>Vivienda</option>
                                            <option value={"entertainment"}>Entretenimiento y Ocio</option>
                                            <option value={"personalCare"}>Ropa y Cuidado Personal</option>
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