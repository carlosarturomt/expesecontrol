import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";
//import { doctor_male, doctor_female, doctor_undefined } from "@assets/users"

export const UserDataContext = createContext();

export function UserDataProvider({ children }) {
	const [user, setUser] = useState([]);
	const [userData, setUserData] = useState({});

	useEffect(() => {
		if (user != null) {
			onAuthStateChanged(auth, (userFirebase) => {
				if (userFirebase) {
					setUser(userFirebase);
				} else {
					setUser(null);
				}
			});
			const userID = user.uid;
			const docRef = doc(db, `users/${userID}`);

			const post = async () => {
				const dataDetail = await getDoc(docRef);
				setUserData({ ...dataDetail.data() });
			};

			if (Object.entries(userData).length === 0) {
				post();
			}
		}
	}, [user]);

	return (
		<UserDataContext.Provider value={{ user, userData }}>
			{children}
		</UserDataContext.Provider>
	);
}