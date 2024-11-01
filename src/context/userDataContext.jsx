import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";
//import { doctor_male, doctor_female, doctor_undefined } from "@assets/users"

export const UserDataContext = createContext();

export function UserDataProvider({ children }) {
	const [user, setUser] = useState([]);
	const [userAuth, setUserAuth] = useState({});
	const [userData, setUserData] = useState({});
	const [userFiles, setUserFiles] = useState({});

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (userFirebase) => {
			if (userFirebase) {
				setUser(userFirebase);

				const userID = userFirebase.uid; // Usar el userFirebase directamente
				const docRefAuth = doc(db, `userAuth/${userID}`);

				// Cargar userAuth
				const authDetail = await getDoc(docRefAuth);
				setUserAuth(authDetail.data() || null); // Asegurarse de que sea null si no existe
			} else {
				setUser(null);
				setUserAuth(null);
				setUserData(null);
			}
		});

		return () => unsubscribe(); // Limpiar el suscriptor al desmontar
	}, []);

	useEffect(() => {
		const loadUserData = async () => {
			if (userAuth && userAuth.username) { // Asegurarse de que userAuth y username estén disponibles
				const docRefData = doc(db, `userData/${userAuth.username}`);
				const dataDetail = await getDoc(docRefData);
				setUserData(dataDetail.data() || null); // Asegurarse de que sea null si no existe
			}
		};

		loadUserData();
	}, [userAuth]);

	useEffect(() => {
		const loadUserData = async () => {
			if (userAuth && userAuth.username) { // Asegurarse de que userAuth y username estén disponibles
				const docRefFiles = doc(db, `userFiles/${userAuth.username}`);
				const dataDetail = await getDoc(docRefFiles);
				setUserFiles(dataDetail.data() || null); // Asegurarse de que sea null si no existe
			}
		};

		loadUserData();
	}, [userAuth]);

	return (
		<UserDataContext.Provider value={{ user, userAuth, userData }}>
			{children}
		</UserDataContext.Provider>
	);
}
