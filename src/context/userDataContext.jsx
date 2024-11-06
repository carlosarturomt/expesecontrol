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

				// Verificar si el usuario tiene definido el corte del día (cutoddDay)
				const cutoddDay = data?.cutoddDay || 12; // Si no está definido, usar 12
				setState(prevState => ({
					...prevState,
					cutoddDay, // Almacenar el corte en el estado
				}));
			}
		};

		loadUserData();
	}, [userAuth]);

	useEffect(() => {
        const fetchGastos = async () => {
            const day = new Date().getDate(); // Cambiado a getDate() para obtener el día del mes
            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            const startDate = new Date(year, month - (day < state.cutoddDay ? 1 : 0), state.cutoddDay); // Usar cutoddDay para el corte
            const endDate = new Date(year, month + 1 - (day < state.cutoddDay ? 0 : 1), state.cutoddDay - 1, 23, 59, 59); // Hasta el día antes del siguiente corte

            let period = "";

            // Determinación del periodo
            if (day < state.cutoddDay) {
                // Si el día es menor al corte, consideramos el mes anterior
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
                // Si el día es igual o mayor al corte, consideramos el mes actual
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
                //console.log(gastosList);
            } catch (error) {
                //console.error("Error al obtener los gastos: ", error);
                setState(prev => ({ ...prev, loading: false, error: "Error al obtener los gastos." }));
            }
        };

        fetchGastos();
    }, [userAuth, state.cutoddDay]); // Dependencia de cutoddDay

	return (
		<UserDataContext.Provider value={{ user, userAuth, userData, userFiles, state, setState, loading }}>
			{children}
		</UserDataContext.Provider>
	);
}
