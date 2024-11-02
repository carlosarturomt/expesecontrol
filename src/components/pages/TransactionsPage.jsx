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
    const { state } = useContext(UserDataContext);


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

            <section className="w-full max-w-screen-sm py-6">
                <h2 className="text-main-dark text-lg font-semibold mb-4">Objetivos Financieros</h2>
                <div className="bg-main-dark/5 rounded-3xl p-4">
                    <p className="text-main-dark">Ahorra para un viaje</p>
                    <div className="bg-blue-500 rounded-full h-2" style={{ width: "60%" }}></div>
                    <p className="text-main-primary font-semibold">Progreso: $600.00 / $1,000.00</p>
                </div>
            </section>


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
                                    <span className="text-main-primary font-semibold">-{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(gasto.gasto)}</span>
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