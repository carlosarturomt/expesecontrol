import { useState } from "react";
import { NavLink } from "react-router-dom";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";
import { InputField } from "@components/atoms/Input";
import { SimpleButton } from "@components/atoms/Button";
/* assets */
import { ICONS } from "@assets/icons";

const Register = () => {
	const [errors, setErrors] = useState({
		username: "",
		email: "",
		password: "",
		general: "",
	});
	const [formValues, setFormValues] = useState({
		email: "",
		password: "",
		username: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [generatedUsername, setGeneratedUsername] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleGoogleSignUp = async () => {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			const userEmail = user.email;

			// Generamos un nombre de usuario basado en el email
			const generated = userEmail.split('@')[0];
			let usernameToUse = generated;

			// Asegurarse de que el nombre de usuario no exceda los 15 caracteres
			if (usernameToUse.length > 15) {
				usernameToUse = usernameToUse.slice(0, 15); // Truncar a 15 caracteres
			}

			setGeneratedUsername(usernameToUse);
			setFormValues((prev) => ({
				...prev,
				email: userEmail,
				username: usernameToUse,
			}));

			// Verificamos si el nombre de usuario ya está en uso
			const isUsernameUnique = await checkUsernameUnique(usernameToUse);
			if (!isUsernameUnique) {
				setGeneratedUsername(`${usernameToUse}${Math.floor(Math.random() * 1000)}`);
			}

			// Abrir el modal para que el usuario confirme su nombre de usuario
			setShowModal(true);
		} catch (err) {
			console.error("Error autenticando con Google:", err);
			setErrors((prev) => ({
				...prev,
				general: "Hubo un error al registrar con Google.",
			}));
		}
	};

	const validateForm = () => {
		const errors = {};

		// Validación de correo electrónico
		if (formValues.email.length < 8 || !/\S+@\S+\.\S+/.test(formValues.email)) {
			errors.email = "Correo electrónico inválido.";
		}

		// Validación de contraseña
		if (formValues.password.length < 8) {
			errors.password = "La contraseña debe tener al menos 8 caracteres.";
		} else if (!/[A-Z]/.test(formValues.password)) {
			errors.password = "La contraseña debe contener al menos una letra mayúscula.";
		} else if (!/[a-z]/.test(formValues.password)) {
			errors.password = "La contraseña debe contener al menos una letra minúscula.";
		} else if (!/[0-9]/.test(formValues.password)) {
			errors.password = "La contraseña debe contener al menos un número.";
		} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formValues.password)) {
			errors.password = "La contraseña debe contener al menos un carácter especial.";
		}

		// Validación de nombre de usuario
		if (formValues.username.length < 5 || formValues.username.length > 20) {
			errors.username = "El nombre de usuario debe tener entre 5 y 20 caracteres.";
		} else if (formValues.username.includes(" ")) {
			errors.username = "El nombre de usuario no puede contener espacios.";
		} else if (/[^a-zA-Z0-9_]/.test(formValues.username)) {
			errors.username = "El nombre de usuario solo puede contener letras, números y guiones bajos.";
		}

		setErrors(errors);
		return errors;
	};

	const checkEmailUnique = async (email) => {
		try {
			const querySnapshot = await getDocs(collection(db, 'userAuth'));
			const emailExists = querySnapshot.docs.some((doc) => doc.data().email === email);
			return !emailExists;
		} catch (err) {
			console.error("Error checking email uniqueness:", err);
			setErrors((prev) => ({ ...prev, general: "Error verificando el correo electrónico." }));
			return false;
		}
	};

	const checkUsernameUnique = async (username) => {
		try {
			const usernameDocRef = doc(db, 'userData', username);
			const docSnapshot = await getDoc(usernameDocRef);
			return !docSnapshot.exists();
		} catch (err) {
			console.error("Error checking username uniqueness:", err);
			setErrors((prev) => ({ ...prev, general: "Error verificando el nombre de usuario." }));
			return false;
		}
	};

	// Función para manejar el nombre de usuario ingresado en el modal
	const handleUsernameChange = async (e) => {
		const { value } = e.target;
		setFormValues((prev) => ({
			...prev,
			username: value,
		}));

		// Validar la unicidad del nombre de usuario en tiempo real
		const isUsernameUnique = await checkUsernameUnique(value);
		if (!isUsernameUnique) {
			setErrors((prev) => ({
				...prev,
				username: "El nombre de usuario ya está en uso.",
			}));
		} else {
			setErrors((prev) => ({
				...prev,
				username: "", // Limpiar el error si el nombre de usuario es único
			}));
		}
	};

	const submitHandler = async (e, isGoogleAuth = false) => {
		e.preventDefault();

		// Si es autenticación con Google, no validamos la contraseña
		if (!isGoogleAuth) {
			const validationErrors = validateForm();
			if (Object.keys(validationErrors).length > 0) return;

			const isEmailUnique = await checkEmailUnique(formValues.email);
			const isUsernameUnique = await checkUsernameUnique(formValues.username);

			if (!isEmailUnique) {
				console.log("El email ya está en uso.")
				setErrors((prev) => ({ ...prev, email: "El email ya está en uso." }));
				return;

			}

			if (!isUsernameUnique) {
				console.log("El usuario ya está en uso.")
				setErrors((prev) => ({ ...prev, username: "El nombre de usuario ya está en uso." }));
				return;
			}
		}

		try {
			let userCredential;

			if (isGoogleAuth) {
				// Autenticación con Google
				console.log('Autenticación con Google');
				const provider = new GoogleAuthProvider();
				userCredential = await signInWithPopup(auth, provider);
				//navigate('/');
			} else {
				// Registro con correo y contraseña
				userCredential = await createUserWithEmailAndPassword(auth, formValues.email, formValues.password);
			}

			const user = userCredential.user;

			await updateProfile(user, { displayName: formValues.username });

			await setDoc(doc(db, `userAuth/${user.uid}`), {
				uid: user.uid,
				email: formValues.email,
				username: formValues.username,
				registrationDate: new Date().toISOString(),
				providerId: user.providerData[0]?.providerId || "password",
				rol: 'user',
			});

			await setDoc(doc(db, `userData/${formValues.username}`), {
				basicInf: {
					firstName: '',
					lastName: '',
					secondLastName: '',
					gender: '',
					birthDate: '',
					maritalStatus: '',
					profileDescription: '',
					website: '',
					language: '',
					socialMediaHandles: {
						twitter: '',
						linkedin: '',
						instagram: '',
						facebook: ''
					},
				},
				contactInf: {
					phoneNumbers: {
						personal: '',
					},
					email: formValues.email,
					emailPersonal: '',
					username: formValues.username,
					password: formValues.password,  // Consider removing this if you don't need it here
					address: {
						region: '',
						country: '',
						mexicoState: '',
						currentCity: '',
						nearestAirport: '',
					},
				},
				expenseControl: {
					budget: '',
					currency: '',
					cutoffDay: '',
				},
				paymentTypes: {
					cash: 'cash',
				},
				uid: user.uid,
				registrationDate: new Date().toISOString(),
			});

			setTimeout(() => location.reload(), 505);
		} catch (err) {
			console.error("Error creating user:", err);
			let errorMessage = "Ocurrió un error al registrar al usuario.";

			if (err.code === "auth/email-already-in-use") {
				errorMessage = "El correo electrónico ya está en uso.";
			} else if (err.code === "auth/invalid-email") {
				errorMessage = "Correo electrónico inválido.";
			} else if (err.code === "auth/weak-password") {
				errorMessage = "La contraseña es demasiado débil.";
			} else if (err.message.includes("network")) {
				errorMessage = "Error de red. Por favor, verifica tu conexión a internet.";
			}

			setErrors((prev) => ({ ...prev, general: errorMessage }));
		}
	};

	// Para usar la función con Google:
	const handleGoogleAuth = (e) => {
		submitHandler(e, true);  // Llamamos al submitHandler con el flag isGoogleAuth como true
	};

	return (
		<>
			<form className="flex-center flex-col p-6 rounded-xl w-10/12 bg-white">
				<h1 className="text-xl font-semibold mb-3 text-main-dark">Registrarse</h1>
				<div className="w-full flex flex-wrap">
					<InputField
						name="email"
						value={formValues.email}
						onChange={handleChange}
						placeholder="Correo electrónico"
						type="email"
						classIcon="bg-white/50"
					/>
					{errors.email && <span className="text-sm text-red-600">{errors.email}</span>}

					<div className="relative w-full">
						<InputField
							name="password"
							value={formValues.password}
							onChange={handleChange}
							placeholder="Contraseña"
							type={showPassword ? "text" : "password"} // Alternar tipo de entrada
							classIcon="bg-white/50"
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
									<path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
									<path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299l.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
									<path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884l-12-12l.708-.708l12 12z" />
								</svg>
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
									<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
									<path d="M8 5.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0a3.5 3.5 0 0 1-7 0" />
								</svg>
							)}
						</button>
					</div>
					{errors.password && <span className="text-sm text-red-600">{errors.password}</span>}

					<InputField
						name="username"
						value={formValues.username}
						onChange={handleChange}
						placeholder="Nombre de usuario"
						type="text"
						classIcon="bg-white/50"
					/>
					{errors.username && <span className="text-sm text-red-600">{errors.username}</span>}
				</div>

				{errors.general && <span className="text-sm text-red-600">{errors.general}</span>}

				<div className={`w-full mt-3 flex-center`}>
					<SimpleButton
						text={"Registrarme"}
						onClick={submitHandler}
						className={`w-full`}
						bgColor={`bg-[#212121] hover:bg-[#212121]/70 text-main-light border-2 border-primary-nightshade/70`}
					/>
				</div>

				<p className="w-full flex-center">
					- o -
				</p>

				<div className="w-full flex flex-wrap">
					{/* Botón de Google */}
					<SimpleButton
						text="Registrarme con Google"
						onClick={handleGoogleSignUp}
						bgColor={`bg-white/70 hover:bg-white text-primary-nightshade`}
						className={`w-full border-2 border-primary-nightshade/70`}
						icon={ICONS.logo.google()}
					/>
				</div>

				<p className={`text-sm mt-6 mb-3 text-main-dark`}>
					¿Tienes una cuenta?
					<NavLink to={"/login"} className={`ml-1 font-semibold hover:underline`}>Iniciar Sesión</NavLink>
				</p>
			</form>

			{/* Modal para completar el registro */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h3 className="text-xl font-semibold mb-4">Confirma tu nombre de usuario</h3>
						<input
							type="text"
							value={formValues.username}
							onChange={handleUsernameChange}
							placeholder="Nombre de usuario"
							className="w-full p-2 border border-gray-300 rounded-md"
						/>
						{errors.username && <span className="text-sm text-red-600">{errors.username}</span>}

						<div className="flex justify-between gap-4 mt-2">
							<SimpleButton text="Cancelar" onClick={() => setShowModal(false)} bgColor={`bg-gray-200 hover:bg-gray-300`} className={`w-1/2`} />
							<SimpleButton
								text="Confirmar"
								onClick={handleGoogleAuth}
								disabled={formValues.username.length < 5 || errors.username}
								className={`${(formValues.username.length < 5 || errors.username) && 'bg-gray-400 cursor-not-allowed'} w-1/2`}
							/>
						</div>
					</div>
				</div>
			)}


		</>
	);
};

export { Register };
