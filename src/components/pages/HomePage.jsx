import { useContext, useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import useAuthRequired from "@hooks/useAuthRequired";
import { Spinner } from "@components/atoms/Spinner";
import { ICONS } from "@assets/icons";
import { UserDataContext } from "../../context/userDataContext";

export default function HomePage() {
    const { isLoading, isAuthenticated } = useAuthRequired("/register", "/");
    const { userAuth } = useContext(UserDataContext);

    const [state, setState] = useState({
        gastos: [],
        loading: true,
        isModalOpen: false,
        gasto: "",
        title: "",
        remarks: "",
        type: "",
        category: "",
        file: null,
        isSubmitting: false,
        error: "", // Añadido para manejar errores
    });

    const openModal = () => setState(prev => ({ ...prev, isModalOpen: true }));
    const closeModal = () => setState(prev => ({ ...prev, isModalOpen: false }));

    useEffect(() => {
        const fetchGastos = async () => {
            try {
                const gastosRef = collection(db, "userPosts", userAuth.username, "gastos");
                const gastosSnap = await getDocs(gastosRef);
                const gastosList = gastosSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setState(prev => ({ ...prev, gastos: gastosList, loading: false }));
            } catch (error) {
                console.error("Error al obtener los gastos: ", error);
                setState(prev => ({ ...prev, loading: false, error: "Error al obtener los gastos." }));
            }
        };

        fetchGastos();
    }, [userAuth.username]);

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
        const { name, value } = e.target;

        // Solo formatear si el campo es "gasto"
        const formattedValue = name === "gasto" ? formatCurrency(value) : value;

        setState((prev) => ({
            ...prev,
            [name]: formattedValue,
        }));
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

        const gastoValue = parseFloat(state.gasto.replace(/[^0-9.-]+/g, ""));

        try {
            let fileURL = "";
            if (state.file) {
                const storageRef = ref(storage, `userFiles/${userAuth.username}/${state.file.name}`);
                await uploadBytes(storageRef, state.file);
                fileURL = await getDownloadURL(storageRef);
            }

            const gastosRef = collection(db, "userPosts", userAuth.username, "gastos");
            await addDoc(gastosRef, {
                gasto: gastoValue,
                title: state.title,
                remarks: state.remarks,
                type: state.type,
                category: state.category,
                fileURL,
                user: userAuth.username,
                createdAt: new Date(),
            });

            // Resetear estado después de enviar
            setState(prev => ({
                ...prev,
                gasto: "",
                title: "",
                remarks: "",
                category: "",
                file: null,
                isModalOpen: false,
                error: "",
            }));
        } catch (error) {
            console.error("Error al subir datos: ", error);
            setState(prev => ({ ...prev, error: "Error al subir los datos.", isSubmitting: false }));
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    if (isLoading || state.loading) {
        return <Spinner bgTheme={true} />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            {/* Sección de Gastos Totales */}
            <section className="w-full max-w-screen-sm mt-6 py-3 flex flex-col items-center">
                <p className="text-main-dark/50">Gastos Totales</p>
                <h1 className="text-4xl font-bold text-main-dark my-2">$17,505.00</h1>
                <p className="text-main-primary">-$7,000.00</p>
            </section>

            {/* Botones para Agregar Gastos */}
            <section className="w-full max-w-screen-sm flex justify-between items-center gap-2 py-3 px-6">
                <button onClick={openModal} className="w-full flex-center gap-1 text-sm font-semibold bg-main-highlight/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark">
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.plus.fill("#FFFFFF")}</i>
                    Agregar Gasto
                </button>
            </section>

            {state.isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex-center z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full h-[95%] relative">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <button onClick={closeModal} className="p-2 text-main-primary">Cancelar</button>

                                <button
                                    type="submit"
                                    disabled={state.isSubmitting}
                                    className="p-2 text-main-highlight rounded hover:bg-main-primary-dark transition"
                                >
                                    {state.isSubmitting ? "Guardando..." : "Agregar"}
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
                                        MXN
                                    </div>
                                </hgroup>

                                <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                    <select value={state.type} onChange={handleChange} className="w-full bg-transparent">
                                        <option value="" hidden className="text-main-gray">Pago con</option>
                                        <option value={"likeU"}>LikeU</option>
                                        <option value={"AMEX"}>AMEX</option>
                                        <option value={"cash"}>Efectivo</option>
                                    </select>
                                </div>

                                <div className="rounded-3xl p-4 mb-4 bg-main-light">
                                    <select value={state.type} onChange={handleChange} className="w-full bg-transparent">
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
                                        name="file"
                                        type="file"
                                        onChange={handleChange}
                                        className="w-full"
                                        accept="image/*, .pdf"
                                    />
                                </div>

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
            )}
            <section className="w-full max-w-screen-sm py-3">
                <h2 className="text-dark text-lg font-semibold mb-4">Notificaciones</h2>
                <div className="bg-main-warning rounded-3xl p-4">
                    <p className="text-dark font-medium">¡Alerta! Has superado tu presupuesto mensual en un 75.05%.</p>
                </div>
            </section>

            <section className="w-full max-w-screen-sm py-3">
                <h2 className="text-main-dark text-lg font-semibold mb-4">Resumen Mensual</h2>
                <div className="bg-main-dark/5 rounded-3xl p-4 flex justify-between items-center">
                    <span className="text-main-dark">Presupuesto</span>
                    <span className="text-main-dark font-semibold">$10,000.00</span>
                </div>
                <div className="bg-main-dark/5 rounded-3xl p-4 flex justify-between items-center mt-2">
                    <span className="text-main-dark">Gastos Totales</span>
                    <span className="text-main-dark font-semibold">-$17,505.00</span>
                </div>
                <div className="bg-main-primary/20 rounded-3xl p-4 flex justify-between items-center mt-2">
                    <span className="text-main-primary font-semibold">Exceso</span>
                    <span className="text-main-primary font-semibold">- $7,505.00 (75.05%)</span>
                </div>
            </section>

            {/* Sección de Últimos Gastos */}
            <section className="w-full max-w-screen-sm py-3 mb-20">
                <h2 className="text-main-dark text-lg font-semibold mb-4">Últimos Gastos</h2>
                <ul className="space-y-3">
                    {state.gastos.length > 0 ? (
                        state.gastos.map((gasto) => (
                            <li key={gasto.id} className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                                <span className="text-main-dark font-medium">{gasto.title || 'Gasto desconocido'}</span>
                                <span className="text-main-primary font-semibold">-${gasto.gasto}</span>
                            </li>
                        ))
                    ) : (
                        <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                            <span className="text-main-dark font-medium">No hay gastos registrados</span>
                        </li>
                    )}
                </ul>
            </section>
        </div>
    )
}