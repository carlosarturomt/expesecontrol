import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@services/firebase/config";
import { InputField } from "@components/atoms/Input";
import { SimpleButton } from "@components/atoms/Button";

const Login = () => {
	const [errors, setErrors] = useState({
		email: "",
		password: "",
	});
	const [formValues, setFormValues] = useState({
		email: "",
		password: "",
	});

	const navigate = useNavigate();

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
		setErrors(errors);
		return errors;
	};

	const submitHandler = async (e) => {
		e.preventDefault();

		// Validar el formulario
		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			console.log(errors);
			return; // Si hay errores, no continuar
		}

		try {
			// Iniciar sesión con correo y contraseña en Firebase Authentication
			await signInWithEmailAndPassword(auth, formValues.email, formValues.password);
			// Redirigir a la página principal o a otra ruta después de iniciar sesión
			navigate('/home'); // Cambia '/home' a la ruta deseada
		} catch (err) {
			console.error('Error logging in:', err);
			setErrors({ general: err.message });
		}
	};

	return (
		<form className="flex-center flex-col p-6 rounded-xl w-10/12 bg-white -mt-60 mb-60">
			<h1 className="text-xl font-semibold mb-3 text-main-dark">Iniciar Sesión</h1>
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
				{errors.password && <span className="text-sm text-red-600">{errors.password}</span>}
				{errors.general && <span className="text-sm text-red-600">{errors.general}</span>}
			</div>

			{/* Botones de navegación */}
			<div className={`w-full my-3 flex-center`}>
				<SimpleButton
					text={"Iniciar Sesión"}
					onClick={submitHandler}
				/>
			</div>
		</form>
	);
};

export { Login };
