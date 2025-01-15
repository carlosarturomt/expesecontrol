import { useContext, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@services/firebase/config";
import useAuthRequired from "@hooks/useAuthRequired";
import { UserDataContext } from "@context/userDataContext";
import { Spinner } from "@components/atoms/Spinner";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
/* assets */
import { female_hair_green, female_rockstar, female_sunglasses_blondie, male_boy, male_grandpa, male_sunglasses, male_tshirt_red, x_male_female_purple } from "../../assets/imgs/avatars";
import { ICONS } from "@assets/icons";

const predefinedAvatars = [
    female_hair_green,
    female_rockstar,
    female_sunglasses_blondie,
    male_boy,
    male_grandpa,
    male_sunglasses,
    male_tshirt_red,
    x_male_female_purple,
];

export default function ProfilePage() {
    const { isLoading, isAuthenticated } = useAuthRequired("/register", "/profile");
    const { loading, userAuth, userData } = useContext(UserDataContext);
    const [newBudget, setNewBudget] = useState(!loading && userData && userData.expenseControl && userData?.expenseControl.budget || '');
    const [newCurrency, setNewCurrency] = useState(!loading && userData && userData.expenseControl && userData?.expenseControl.currency || 'MXN');
    const [newCutoffDay, setNewCutoffDay] = useState(!loading && userData && userData.expenseControl && userData?.expenseControl.cutoffDay || '1');
    const [paymentType, setPaymentType] = useState('');
    const [cardType, setCardType] = useState('');
    const [incomeType, setIncomeType] = useState('');
    const [incomeCategory, setIncomeCategory] = useState('');

    const [selectedAvatar, setSelectedAvatar] = useState(userData?.profilePhoto || "");
    const [customAvatar, setCustomAvatar] = useState(null);

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

    const handleUpdateProfilePhoto = async () => {
        if (userAuth && userData) {
            const userDocRef = doc(db, "userData", userAuth.username);
            try {
                const photoToUpdate = customAvatar || selectedAvatar;
                await updateDoc(userDocRef, {
                    profilePhoto: photoToUpdate,
                });
                console.log("Profile photo updated successfully");
                setTimeout(() => location.reload(), 1000);
            } catch (error) {
                console.error("Error updating profile photo:", error);
            }
        }
    };

    const handleCustomAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setCustomAvatar(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();

        handleUpdateProfilePhoto()

        if (userData && userData.expenseControl) {
            const userDocRef = doc(db, "userData", userAuth.username);

            // Construimos un objeto para la actualización
            const updateData = {
                // Actualizar control de gastos
                "expenseControl.budget": newBudget,
                "expenseControl.currency": newCurrency,
                "expenseControl.cutoffDay": newCutoffDay,
                ...(paymentType && cardType ? { [`paymentTypes.${paymentType}`]: cardType } : {}),
                // Actualizar control de ingresos
                ...(incomeType && incomeCategory ? { [`incomeControl.paymentTypes.${incomeType}`]: incomeCategory } : {}),
            };

            try {
                await updateDoc(userDocRef, updateData);
                console.log("Updated successfully");
                setTimeout(() => location.reload(), 1000)
            } catch (error) {
                console.error("Error updating budget, currency, and paymentTypes:", error);
            }
        } else {
            console.error("userData or expenseControl is not available");
        }
    };

    const availableCardOptions = ["card1", "card2", "card3", "card4", "card5"].filter(
        card => !(userData?.paymentTypes && userData.paymentTypes[card])
    );

    const availablePayOptions = ["type1", "type2", "type3", "type4", "type5"].filter(
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
                <div className="w-full flex items-center gap-2">
                    <img
                        src={customAvatar || selectedAvatar || x_male_female_purple}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border"
                    />
                    <hgroup className="">
                        <h1 className="text-2xl font-bold leading-5 text-main-dark">{userData?.contactInf?.username}</h1>
                        <p className="text-sm text-main-primary">{userData?.contactInf?.email}</p>
                    </hgroup>
                </div>

                {/* Profile Photo Section */}
                <div className="mt-4">
                    <h3 className="text-main-dark font-semibold mt-4">Actualizar foto de perfil</h3>

                    {/* Predefined Avatars */}
                    <div className="flex gap-4 mt-4 overflow-x-auto">
                        {predefinedAvatars.map((avatar) => (
                            <img
                                key={avatar}
                                src={avatar}
                                alt="Predefined Avatar"
                                className={`w-16 h-16 rounded-full cursor-pointer border ${selectedAvatar === avatar ? "border-main-primary" : "border-gray-300"
                                    }`}
                                onClick={() => setSelectedAvatar(avatar)}
                            />
                        ))}
                    </div>

                    {/* Upload Custom Avatar */}
                    {/* <div className="mt-4">
                        <label
                            htmlFor="upload-avatar"
                            className="block text-main-dark cursor-pointer font-medium"
                        >
                            Subir foto personalizada
                        </label>
                        <input
                            type="file"
                            id="upload-avatar"
                            accept="image/*"
                            className="mt-2"
                            onChange={handleCustomAvatarChange}
                        />
                    </div> */}

                    {/* <button
                        onClick={handleUpdateProfilePhoto}
                        className="mt-4 bg-main-primary text-white px-4 py-2 rounded-full hover:bg-main-primary/90"
                    >
                        Guardar cambios
                    </button> */}
                </div>
            </section>


            <section className="w-full max-w-screen-sm py-6">
                <form onSubmit={handleUpdateBudget}>
                    <div className="relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5">
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
                            {!loading && userData && userData.expenseControl && userData?.expenseControl.currency}
                        </div>
                    </div>

                    <div className="relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5">
                        <label htmlFor="cutoffDay" className="absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50">
                            Día de corte
                        </label>
                        <div className="flex-center pt-2 py-2">
                            <input
                                name="cutoffDay"
                                type="number"
                                placeholder="Define el día de corte. Ej: 1"
                                value={newCutoffDay}
                                onChange={(e) => setNewCutoffDay(e.target.value)}
                                className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                required
                            />
                        </div>
                    </div>

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

                    <div className="relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5">
                        <label htmlFor="paymentTypes" className="absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50">
                            Tipos de Pago (Control de Gastos)
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

                    <div className="relative rounded-3xl py-2 px-4 mb-4 bg-main-dark/5">
                        <label htmlFor="incomeTypes" className="absolute -top-2 text-sm font-medium rounded-full px-1 text-gray-700/50">
                            Tipos de Ingreso
                        </label>
                        <span className="flex-center pt-2 py-2">
                            <select
                                name="incomeTypes"
                                className="w-1/3 bg-transparent outline-none"
                                value={incomeType}
                                onChange={(e) => setIncomeType(e.target.value)}
                            >
                                <option value="" disabled>Dar de alta</option>
                                {availablePayOptions.map((type) => (
                                    <option key={type} value={type}>
                                        {`Tipo de ingreso ${type.charAt(4)}`}
                                    </option>
                                ))}
                                <option value="other">Otro tipo de ingreso</option>
                            </select>

                            {/* Mostrar el input solo si se seleccionó un tipo de ingreso */}
                            {(incomeType && (
                                <input
                                    name="incomeCategory"
                                    type="text"
                                    placeholder="Ej: Transferencia, Cheque"
                                    value={incomeCategory}
                                    onChange={(e) => setIncomeCategory(e.target.value)}
                                    className="w-full pl-1 bg-transparent outline-none text-main-dark placeholder:text-main-dark/50"
                                    required
                                />
                            ))}
                        </span>
                        <span className="text-main-dark/50">
                            Por defecto ya está habilitado el tipo de ingreso en efectivo, no es necesario que lo coloques.
                        </span>
                    </div>

                    <button type="submit" className="border rounded-3xl p-4 font-semibold text-main-dark hover:bg-main-highlight/10">Actualizar</button>
                </form>

                <button onClick={handleLogout} className="border rounded-3xl p-4 mt-4 mb-12 font-semibold text-main-dark hover:bg-main-highlight/10">Cerrar Sesión</button>
            </section>
        </div>
    );
}
