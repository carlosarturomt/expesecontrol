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
    const { loading, userAuth, userData } = useContext(UserDataContext);
    const [newBudget, setNewBudget] = useState(!loading && userData?.expenseControl.budget || 0);
    const [newCurrency, setNewCurrency] = useState(!loading && userData?.expenseControl.currency || 'MXN');
    const [paymentType, setPaymentType] = useState('');
    const [cardType, setCardType] = useState('');

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

        if (userData && userData.expenseControl) {
            const userDocRef = doc(db, "userData", userAuth.username);

            // Construimos un objeto para la actualización
            const updateData = {
                "expenseControl.budget": newBudget,
                "expenseControl.currency": newCurrency,
                // Solo actualizamos paymentType si paymentType no es vacío
                ...(paymentType && cardType ? { [`paymentTypes.${paymentType}`]: cardType } : {}),
            };

            try {
                await updateDoc(userDocRef, updateData);
                console.log("Updated successfully");
            } catch (error) {
                console.error("Error updating budget, currency, and paymentTypes:", error);
            }
        } else {
            console.error("userData or expenseControl is not available");
        }
    };

    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        setPaymentType(selectedValue);

        // Si el usuario selecciona cualquier tarjeta, dejamos vacío el input para que puedan escribir
        if (selectedValue !== 'other') {
            setCardType('');
        }
    };

    const handleInputChange = (event) => {
        setCardType(event.target.value);
    };

    const availableCardOptions = ["card1", "card2", "card3", "card4", "card5"].filter(
        card => !(userData?.paymentTypes && userData.paymentTypes[card])
    );

    if (isLoading || loading || !userData) {
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
                    <hgroup className="relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5">
                        <label htmlFor="budget" className="absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50">
                            Presupuesto
                        </label>
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
                            {userData?.expenseControl.currency}
                        </div>
                    </hgroup>

                    <div className="relative rounded-3xl p-4 mb-4 bg-main-dark/5">
                        <label htmlFor="currency" className="absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50">
                            Divisa
                        </label>
                        <select
                            name="currency"
                            value={newCurrency}
                            onChange={(e) => setNewCurrency(e.target.value)}
                            className="w-full bg-transparent outline-none"
                        >
                            <option value="MXN">MXN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>

                    {/* <p className="relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5">
                        <label htmlFor="paymentTypes" className="absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50">
                            Tipos de Pago
                        </label>
                        <span className="flex-center pt-2 py-2">
                            <select
                                name="currency"
                                className="w-full bg-transparent outline-none"
                            >
                                <option value="" disabled selected>Dar de alta</option>
                                <option value="card1">Tarjeta 1</option>
                                <option value="card2">Tarjeta 2</option>
                                <option value="card3">Tarjeta 3</option>
                                <option value="card4">Tarjeta 4</option>
                                <option value="card5">Tarjeta 5</option>
                                <option value="other">Otro tipo de pago</option>
                            </select>

                            <input
                                name="gasto"
                                type="text"
                                placeholder="Tipo de pago (Ej: likeU, AMEX)"
                                value={paymentType}  // Vincular el valor al estado
                                onChange={handleInputChange}  // Manejar el cambio
                                className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                required
                            />
                        </span>
                        <span className="text-main-dark/50">
                            Por defecto ya está habilitado el tipo de pago en efectivo, no es necesario que lo coloques.
                        </span>
                    </p> */}

                    <div className="relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5">
                        <label htmlFor="paymentTypes" className="absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50">
                            Tipos de Pago
                        </label>
                        <span className="flex-center pt-2 py-2">
                            <select
                                name="currency"
                                className="w-1/3 bg-transparent outline-none"
                                value={paymentType}
                                onChange={handleSelectChange}
                            >
                                <option value="" disabled>Dar de alta</option>
                                {availableCardOptions.map((card) => (
                                    <option key={card} value={card}>
                                        {`Tarjeta ${card.charAt(4)}`}
                                    </option>
                                ))}
                                <option value="other">Otro tipo de pago</option>
                            </select>

                            {/* Mostrar el input solo si se seleccionó una tarjeta o "Otro tipo de pago" */}
                            {(paymentType !== "" && paymentType !== "other") && (
                                <input
                                    name="gasto"
                                    type="text"
                                    placeholder="Ej: LikeU, AMEX, Débito"
                                    value={cardType}  // Vinculamos con el estado para permitir al usuario escribir
                                    onChange={handleInputChange}
                                    className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                    required
                                />
                            )}

                            {/* Si seleccionaron "Otro tipo de pago", se deja un campo de texto vacío */}
                            {paymentType === 'other' && (
                                <input
                                    name="gasto"
                                    type="text"
                                    placeholder="Especifica el tipo de pago"
                                    value={cardType}
                                    onChange={handleInputChange}
                                    className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                    required
                                />
                            )}
                        </span>
                        <span className="text-main-dark/50">
                            Por defecto ya está habilitado el tipo de pago en efectivo, no es necesario que lo coloques.
                        </span>
                    </div>

                    <button type="submit" className="border rounded-3xl p-4 font-semibold text-main-dark hover:bg-main-highlight/10">Actualizar</button>
                </form>
                <button onClick={handleLogout} className="border rounded-3xl p-4  mt-4 font-semibold text-main-dark hover:bg-main-highlight/10">Cerrar Sesión</button>
            </section>
        </div>
    );
}
