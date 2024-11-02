import { useContext, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@services/firebase/config";
import useAuthRequired from "@hooks/useAuthRequired";
import { UserDataContext } from "@context/userDataContext";
import { Spinner } from "@components/atoms/Spinner";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ICONS } from "@assets/icons";

export default function ProfilePage() {
    const { isLoading, isAuthenticated } = useAuthRequired("/register", "/profile");
    const { userAuth, userData } = useContext(UserDataContext);
    const [newBudget, setNewBudget] = useState(userData?.budget || 0);

    const navigate = useNavigate();

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                navigate("/");
                console.log("Signed out successfully");
                window.location.reload();
            })
            .catch((error) => {
                console.log("error");
            });
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();

        if (userData) {
            const userDocRef = doc(db, "userData", userAuth.username);

            try {
                await updateDoc(userDocRef, {
                    budget: newBudget,
                });
                console.log("Budget updated successfully");
            } catch (error) {
                console.error("Error updating budget:", error);
            }
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
            <section className="w-full max-w-screen-sm mt-6 py-3 flex flex-col items-center">
                <p className="text-main-dark/50">Profile</p>
                <h1 className="text-4xl font-bold text-main-dark my-2">{userData && userData.contactInf.username}</h1>
                <p className="text-main-primary">{userData && userData.contactInf.email}</p>
            </section>

            <section className="w-full max-w-screen-sm py-6">
                <form onSubmit={handleUpdateBudget}>
                    <label htmlFor="budget" className="block mb-2 text-sm font-medium text-gray-700">
                        Budget
                    </label>

                    <hgroup className="rounded-3xl py-2 px-4 mb-4 bg-main-dark/5 ">
                        <div className="flex-center pt-2 py-2">
                            $
                            <input
                                name="gasto"
                                type="number"
                                placeholder="$ $"
                                value={newBudget}
                                onChange={(e) => setNewBudget(Number(e.target.value))}
                                className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                required
                            />
                            MXN
                        </div>
                    </hgroup>

                    <button type="submit" className="border rounded-3xl p-4 font-semibold text-main-dark">Update Budget</button>
                </form>
                <button onClick={handleLogout} className="border rounded-3xl p-4 font-semibold text-main-dark mt-4">Log out</button>
            </section>
        </div>
    );
}
