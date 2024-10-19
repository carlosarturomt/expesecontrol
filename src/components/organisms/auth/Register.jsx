import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@services/firebase/config";
import { InputField } from "@components/atoms/Input";
import { SimpleButton } from "@components/atoms/Button";

const Register = () => {
	const [errors, setErrors] = useState({
		username: "",
		email: "",
		password: "",
	});
	const [formValues, setFormValues] = useState({
		email: "",
		password: "",
		username: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const validateForm = () => {
		const errors = {};
		if (formValues.email.length < 8 || !/\S+@\S+\.\S+/.test(formValues.email)) {
			errors.email = "Invalid email.";
		}
		if (formValues.password.length < 3) {
			errors.password = "Password is too short.";
		}
		if (formValues.username.length < 6 || formValues.username.includes(' ')) {
			errors.username = "Username must be at least 6 characters and not contain spaces.";
		}
		setErrors(errors);
		return errors;
	};

	const checkUsernameUnique = async (username) => {
		const usernameDocRef = doc(db, 'userData', username);
		const docSnapshot = await getDoc(usernameDocRef);

		return !docSnapshot.exists();
	};

	const submitHandler = async (e) => {
		e.preventDefault();

		// Validar el formulario
		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			console.log(errors);
			return; // Si hay errores, no continuar
		}

		// Verificar si el username es único antes de crear el usuario
		const userInputUsername = formValues.username;
		const isUsernameUnique = await checkUsernameUnique(userInputUsername);

		if (!isUsernameUnique) {
			setErrors((prev) => ({ ...prev, username: 'Username already in use. Please choose another one.' }));
			console.log('Username already exists:', userInputUsername);
			return; // Si el username ya existe, detener la ejecución
		}

		try {
			// Crear usuario con correo y contraseña en Firebase Authentication
			const userCredential = await createUserWithEmailAndPassword(auth, formValues.email, formValues.password);
			const user = userCredential.user;

			// Actualizar perfil del usuario con el nombre
			await updateProfile(user, { username: formValues.username });

			// Guardar los datos del usuario en Firestore en userAuth
			await setDoc(doc(db, `userAuth/${user.uid}`), {
				uid: user.uid,
				email: formValues.email,
				password: formValues.password,
				displayName: '',
				username: userInputUsername,
				registrationDate: new Date().toISOString(),
				providerId: user.providerData[0].providerId,
				rol: 'user'
			});

			// Guardar los datos adicionales del usuario en Firestore en userData
			await setDoc(doc(db, `userData/${userInputUsername}`), {
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
					username: userInputUsername,
					password:formValues.password,
					address: {
						region: '',
						country: '',
						mexicoState: '',
						currentCity: '',
						nearestAirport: '',
					},
				},
				uid: user.uid,
				registrationDate: new Date().toISOString(),
			});
		} catch (err) {
			console.error('Error creating user:', err);
			setErrors({ general: err.message });
		}
	};

	return (
		<form className="flex-center flex-col p-6 rounded-xl w-10/12 bg-white -mt-60 mb-60">
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
				<InputField
					name="password"
					value={formValues.password}
					onChange={handleChange}
					placeholder="Contraseña"
					type="password"
					classIcon="bg-white/50"
				/>
				<InputField
					name="username"
					value={formValues.username}
					onChange={handleChange}
					placeholder="Username"
					type="text"
					classIcon="bg-white/50"
				/>
				{errors.general && <span className="text-sm text-red-600">{errors.general}</span>}
			</div>

			{/* Botones de navegación */}
			<div className={`w-full my-3 flex-center`}>
				<SimpleButton
					text={"Registrar"}
					onClick={submitHandler}
				/>
			</div>
		</form>
	);
};

export { Register };