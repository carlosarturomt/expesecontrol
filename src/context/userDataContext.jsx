import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";

export const UserDataContext = createContext();

export function UserDataProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userAuth, setUserAuth] = useState({});
    const [userData, setUserData] = useState({});
    const [userPlans, setUserPlans] = useState({});
    const [userFiles, setUserFiles] = useState({});
    const [loading, setLoading] = useState(true);

    const [state, setState] = useState({
        gastos: [],
        ingresos: [], // Aquí ya tienes el estado de ingresos
        loading: true,
        isModalOpen: false,
        gasto: "",
        ingreso: "", // Para manejar el nuevo ingreso
        title: "",
        remarks: "",
        type: "",
        category: "",
        file: null,
        date: new Date().toISOString().substring(0, 10),
        isSubmitting: false,
        error: "",
        filterByPeriod: false, // Control para alternar entre todos o periodo específico
        period: "",
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userFirebase) => {
            if (userFirebase) {
                setUser(userFirebase);

                const userID = userFirebase.uid;
                const docRefAuth = doc(db, `userAuth/${userID}`);

                // Cargar userAuth
                const authDetail = await getDoc(docRefAuth);
                setUserAuth(authDetail.data() || null);
            } else {
                setUser(null);
                setUserAuth(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Limpiar el suscriptor al desmontar
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            if (userAuth && userAuth.username) {
                const docRefData = doc(db, `userData/${userAuth.username}`);
                const dataDetail = await getDoc(docRefData);
                const data = dataDetail.data() || null;
                setUserData(data);

                const cutoddDay = data?.cutoddDay || 12; // Si no está definido, usar 12
                setState((prevState) => ({
                    ...prevState,
                    cutoddDay,
                }));
            }
        };

        loadUserData();
    }, [userAuth]);

    useEffect(() => {
        const loadUserPlans = async () => {
            if (userAuth && userAuth.username) {
                const docRefPlans = doc(db, `userPlans/${userAuth.uid}`);
                const planDetail = await getDoc(docRefPlans);
                const data = planDetail.data() || null;
                setUserPlans(data);
            }
        };

        loadUserPlans();
    }, [userAuth]);

    useEffect(() => {
        const fetchGastos = async () => {
            let gastosRef;
            const year = new Date().getFullYear();
            const { filterByPeriod, period, cutoddDay } = state;

            if (filterByPeriod && period) {
                const startDate = new Date(year, new Date().getMonth(), cutoddDay);
                const endDate = new Date(year, new Date().getMonth() + 1, cutoddDay - 1, 23, 59, 59);

                gastosRef = collection(db, "userPosts", userAuth.username, "gastos", `${year}`, period);
            } else {
                gastosRef = collection(db, "userPosts", userAuth.username, "gastos");
            }

            try {
                const q = filterByPeriod
                    ? query(gastosRef, where("createdAt", ">=", startDate), where("createdAt", "<=", endDate))
                    : query(gastosRef);

                const gastosSnapshot = await getDocs(q);
                const gastosList = gastosSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(), // Asegurar que sea un Date
                }));

                setState((prev) => ({ ...prev, gastos: gastosList, loading: false }));
            } catch (error) {
                setState((prev) => ({ ...prev, loading: false, error: "Error al obtener los gastos." }));
            }
        };

        const fetchIngresos = async () => {
            let ingresosRef;
            const year = new Date().getFullYear();
            const { filterByPeriod, period, cutoddDay } = state;

            if (filterByPeriod && period) {
                const startDate = new Date(year, new Date().getMonth(), cutoddDay);
                const endDate = new Date(year, new Date().getMonth() + 1, cutoddDay - 1, 23, 59, 59);

                ingresosRef = collection(db, "userPosts", userAuth.username, "ingresos", `${year}`, period);
            } else {
                ingresosRef = collection(db, "userPosts", userAuth.username, "ingresos");
            }

            try {
                const q = filterByPeriod
                    ? query(ingresosRef, where("createdAt", ">=", startDate), where("createdAt", "<=", endDate))
                    : query(ingresosRef);

                const ingresosSnapshot = await getDocs(q);
                const ingresosList = ingresosSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(), // Asegurar que sea un Date
                }));

                setState((prev) => ({ ...prev, ingresos: ingresosList, loading: false }));
            } catch (error) {
                setState((prev) => ({ ...prev, loading: false, error: "Error al obtener los ingresos." }));
            }
        };

        if (userAuth && userAuth.username) {
            fetchGastos();
            fetchIngresos(); // Llamada para cargar los ingresos
        }
    }, [userAuth, state.filterByPeriod, state.period]);

    return (
        <UserDataContext.Provider value={{ user, userAuth, userData, userPlans, userFiles, state, setState, loading }}>
            {children}
        </UserDataContext.Provider>
    );
}