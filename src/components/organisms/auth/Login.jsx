import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
	const [showPassword, setShowPassword] = useState(false);

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
			navigate('/'); // Cambia '/home' a la ruta deseada
		} catch (err) {
			//console.error('Error logging in:', err);
			setErrors({ general: err.message });
		}
	};

	return (
		<form className="flex-center flex-col p-6 rounded-xl w-10/12 bg-white">
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
				{/* <InputField
					name="password"
					value={formValues.password}
					onChange={handleChange}
					placeholder="Contraseña"
					type="password"
					classIcon="bg-white/50"
				/> */}
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
				{errors.general && <span className="text-sm text-red-600">{errors.general}</span>}
			</div>

			{/* Botones de navegación */}
			<div className={`w-full my-3 flex-center`}>
				<SimpleButton
					text={"Iniciar Sesión"}
					onClick={submitHandler}
				/>
			</div>

			<NavLink to={"/register"} className={"text-sm text-main-dark hover:underline"}>Quiero registrarme</NavLink>

		</form>
	);
};

export { Login };
