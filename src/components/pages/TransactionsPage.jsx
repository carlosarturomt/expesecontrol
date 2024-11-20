import { useContext, useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import useAuthRequired from "@hooks/useAuthRequired";
import { UserDataContext } from "@context/userDataContext";
import { Spinner } from "@components/atoms/Spinner";
import { SwipeableCard } from "@components/atoms/Button";
import { ICONS } from "@assets/icons";
import { FilterButton } from "../atoms/Button";

export default function TransactionsPage() {
    const { isLoading, isAuthenticated } = useAuthRequired("/register", "/transactions");
    const { loading, userAuth, userData, state, setState } = useContext(UserDataContext);
    const [expandedGastoId, setExpandedGastoId] = useState(null);
    const [filterText, setFilterText] = useState('');


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

        console.log("Rango de fechas:", { startDate, endDate });

        // Filtrar los gastos
        const gastosFiltrados = state.gastos.filter((gasto) => {
            const gastoDate = gasto.createdAt instanceof Date ? gasto.createdAt : gasto.createdAt.toDate();
            console.log("GastoDate:", gastoDate, "Dentro del rango:", gastoDate >= startDate && gastoDate <= endDate);
            return gastoDate >= startDate && gastoDate <= endDate;
        });


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

    // Filtra los gastos en función del texto del filtro
    const filteredGastos = state.gastos
        .filter(gasto => gasto.title.toLowerCase().includes(filterText.toLowerCase()) || gasto.remarks.toLowerCase().includes(filterText.toLowerCase()) || gasto.category.toLowerCase().includes(filterText.toLowerCase()))
        .sort((a, b) => b.createdAt - a.createdAt);

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

    const handleCardClick = (id) => {
        setExpandedGastoId(expandedGastoId === id ? null : id);
    };

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

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar este gasto?`);
        if (confirmDelete) {
            try {
                const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", id);
                await deleteDoc(gastoRef);

                console.log(`Gasto con ID: ${id} eliminado.`);

                // Actualiza el estado local en lugar de recargar la página
                setState((prev) => ({
                    ...prev,
                    gastos: prev.gastos.filter((gasto) => gasto.id !== id),
                }));
            } catch (error) {
                console.error("Error al eliminar el gasto: ", error);
            }
        }
    };

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
                const gastoRef = doc(db, "userPosts", userAuth.username, "gastos", String(state.currentGastoId));
                await updateDoc(gastoRef, dataToSave);
            } else {
                const gastosRef = collection(db, "userPosts", userAuth.username, "gastos");
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
                <p className="text-main-dark/50">Transacciones</p>
                {/* <h1 className="text-4xl font-bold text-main-dark my-2">$17,505.00</h1>
                <p className="text-main-primary">-$7,000.00</p> */}
            </section>

            <section className="relative py-2 mb-2 flex items-center">
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
            </section>

            {/* Sección de Últimos Gastos */}
            <section className="w-full max-w-screen-sm mb-20">
                <hgroup className="mb-2">
                    <h2 className="text-main-dark py-2 text-lg font-semibold border-b border-main-dark/20">Gastos</h2>
                    <p className="py-2 text-sm font-light text-main-dark/50">{filteredGastos.length} Resultados</p>
                </hgroup>

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
                            .map((gasto) => (
                                <SwipeableCard
                                    key={gasto.id}
                                    context={userData}
                                    data={gasto}
                                    onEdit={() => handleEdit(gasto.id)}
                                    onDelete={() => handleDelete(gasto.id)}
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
                                            {!loading && userData?.expenseControl.currency}
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