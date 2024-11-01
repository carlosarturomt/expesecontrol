import { useContext, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "@services/firebase/config";
import useAuthRequired from "@hooks/useAuthRequired";
import { Spinner } from "@components/atoms/Spinner";
import { ICONS } from "@assets/icons";
import { UserDataContext } from "../../context/userDataContext";

export default function HomePage() {
    const { isLoading, isAuthenticated } = useAuthRequired("/register", "/");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gasto, setGasto] = useState("");
    const [texto, setTexto] = useState("");
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { userAuth } = useContext(UserDataContext);

    console.log(userAuth.username);



    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let fileURL = "";
            if (file) {
                const storageRef = ref(storage, `userFiles/${userAuth.username}/${file.name}`);
                await uploadBytes(storageRef, file);
                fileURL = await getDownloadURL(storageRef);
            }

            await setDoc(doc(db, "userPosts", userAuth.username), {
                gasto,
                texto,
                fileURL,
                user: userAuth.username,
                createdAt: new Date(),
            });

            setGasto("");
            setTexto("");
            setFile(null);
            closeModal();
        } catch (error) {
            console.error("Error al subir datos: ", error);
        } finally {
            setIsSubmitting(false);
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
                <p className="text-main-dark/50">Gastos Totales</p>
                <h1 className="text-4xl font-bold text-main-dark my-2">$17,505.00</h1>
                <p className="text-main-primary">-$7,000.00</p>
            </section>

            {/* Botones para Agregar Gastos */}
            <section className="w-full max-w-screen-sm flex justify-between items-center gap-2 py-3 px-6">
                <button onClick={openModal} className="w-1/2 flex-center gap-1 text-sm font-semibold bg-main-highlight/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark">
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.plus.fill("#FFFFFF")}</i>
                    Agregar
                </button>
                <button className="w-1/2 flex-center gap-1 text-sm font-semibold bg-main-dark/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark">
                    <i className="flex-center w-6 h-6 rounded-full hover:scale-105">{ICONS.subtract.fill("#FFFFFF")}</i>
                    Retirar
                </button>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
                        <button onClick={closeModal} className="absolute top-3 right-3 text-main-dark text-2xl">&times;</button>
                        <h2 className="text-xl font-bold mb-4">Agregar Gasto</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="number"
                                placeholder="Gasto"
                                value={gasto}
                                onChange={(e) => setGasto(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                            <textarea
                                placeholder="Descripción"
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full p-2"
                                accept="image/*, .pdf"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full p-2 bg-main-highlight text-white rounded hover:bg-main-primary-dark transition"
                            >
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </button>
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
                <ul className="space-y-3">
                    <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                        <span className="text-main-dark font-medium">Comida</span>
                        <span className="text-main-primary font-semibold">-$500.00</span>
                    </li>
                    <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                        <span className="text-main-dark font-medium">Transporte</span>
                        <span className="text-main-primary font-semibold">-$300.00</span>
                    </li>
                    <li className="flex justify-between items-center bg-main-dark/5 rounded-3xl p-4">
                        <span className="text-main-dark font-medium">Entretenimiento</span>
                        <span className="text-main-primary font-semibold">-$150.00</span>
                    </li>
                </ul>
            </section>
        </div>
    )
}