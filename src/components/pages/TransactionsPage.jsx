import { useContext, useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import useAuthRequired from "@hooks/useAuthRequired";
import { UserDataContext } from "@context/userDataContext";
import { Spinner } from "@components/atoms/Spinner";
import { ICONS } from "@assets/icons";

export default function TransactionsPage() {
    const { isLoading, isAuthenticated } = useAuthRequired("/register", "/transactions");
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
        date: new Date().toISOString().substring(0, 10),
        isSubmitting: false,
        error: "",
    });

    useEffect(() => {
        const fetchGastos = async () => {
            const day = new Date().getDate(); // Cambiado a getDate() para obtener el día del mes
            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            const startDate = new Date(year, month - (day < 12 ? 1 : 0), 12); // Desde el 12 del mes anterior o actual
            const endDate = new Date(year, month + 1 - (day < 12 ? 0 : 1), 11, 23, 59, 59); // Hasta el 11 del mes siguiente


            let period = "";

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
                const gastosRef = collection(db, "userPosts", userAuth.username, "gastos", `${year}`, period);
                const q = query(gastosRef,
                    where("createdAt", ">=", startDate),
                    where("createdAt", "<=", endDate)
                );

                const gastosSnapshot = await getDocs(q);
                const gastosList = gastosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setState(prev => ({ ...prev, gastos: gastosList, loading: false }));
                //console.log("userPosts", userAuth.username, "gastos", `${year}`, period);
                console.log(gastosList);
            } catch (error) {
                console.error("Error al obtener los gastos: ", error);
                setState(prev => ({ ...prev, loading: false, error: "Error al obtener los gastos." }));
            }
        };

        fetchGastos();
    }, [userAuth.username]);


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
                <p className="text-main-dark/50">Transaccione</p>
                <h1 className="text-4xl font-bold text-main-dark my-2">$17,505.00</h1>
                <p className="text-main-primary">-$7,000.00</p>
            </section>

            {/* Botones para Agregar Gastos */}
            <section className="w-full max-w-screen-sm flex justify-between items-center gap-2 py-3 px-6">
                <button className="w-1/2 flex-center gap-1 text-sm font-semibold bg-main-highlight/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark">
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.plus.fill("#FFFFFF")}</i>
                    Agregar
                </button>
                <button className="w-1/2 flex-center gap-1 text-sm font-semibold bg-main-dark/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark">
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.subtract.fill("#FFFFFF")}</i>
                    Retirar
                </button>
            </section>

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

            {/* <section className="w-full max-w-screen-sm py-6 mb-6">
            <h2 className="text-main-dark text-lg font-semibold mb-4">Objetivos Financieros</h2>
            <div className="bg-main-dark/5 rounded-3xl p-4">
                <p className="text-main-dark">Ahorra para un viaje</p>
                <div className="bg-blue-500 rounded-full h-2" style={{ width: "60%" }}></div>
                <p className="text-main-primary font-semibold">Progreso: $600.00 / $1,000.00</p>
            </div>
        </section> */}


            {/* Sección de Últimos Gastos */}
            <section className="w-full max-w-screen-sm py-3 mb-20">
                <h2 className="text-main-dark text-lg font-semibold mb-4">Últimos Gastos</h2>
                {state.loading ? (
                        <Spinner bgTheme={true} />
                    ) : state.gastos.length > 0 ? (
                        <ul className="space-y-3">
                            {state.gastos
                                .sort((a, b) => b.createdAt - a.createdAt)
                                .map(gasto => (
                                    <li key={gasto.id} className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                                        <span className="text-main-dark font-medium">{gasto.title || 'Gasto desconocido'}</span>
                                        <span className="text-main-primary font-semibold">-${gasto.gasto}</span>
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                            <span className="text-main-dark font-medium">No hay gastos registrados</span>
                        </li>
                    )}
            </section>

        </div>
    )
}