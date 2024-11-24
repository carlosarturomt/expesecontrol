import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";

export const UserDataContext = createContext();

export function UserDataProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userAuth, setUserAuth] = useState({});
    const [userData, setUserData] = useState({});
    const [userFiles, setUserFiles] = useState({});
    const [loading, setLoading] = useState(true);

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
                //console.log("Gastos cargados:", gastosList);

                setState((prev) => ({ ...prev, gastos: gastosList, loading: false }));
            } catch (error) {
                //console.error("Error al obtener los gastos:", error);
                setState((prev) => ({ ...prev, loading: false, error: "Error al obtener los gastos." }));
            }
        };

        if (userAuth && userAuth.username) {
            fetchGastos();
        }
    }, [userAuth, state.filterByPeriod, state.period]);

    return (
        <UserDataContext.Provider value={{ user, userAuth, userData, userFiles, state, setState, loading }}>
            {children}
        </UserDataContext.Provider>
    );
}
