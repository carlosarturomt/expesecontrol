import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "@services/firebase/config";
import { ICONS } from "@assets/icons"
import { signOut } from "firebase/auth";

const ValidateButton = ({ onClick, disabled, loading, text }) => {
	return (
		<button
			className="w-full h-10 rounded-md uppercase my-2 text-white bg-main-blue"
			onClick={onClick}
			disabled={disabled}
		>
			{loading ? "Validando..." : text}
		</button>
	);
};

const SimpleButton = ({ onClick, disabled, text, bgColor, isSubmit }) => {
	return (
		<button
			type={isSubmit ? "submit" : "button"} // Cambia el tipo según sea necesario
			className={`${bgColor ? bgColor : 'bg-main-blue/80'} ${bgColor && bgColor.includes('bg-main-light') ? 'text-main-prusia' : 'text-white'} w-full flex-center gap-1 text-sm font-semibold bg-main-highlight/70 text-white rounded-3xl p-3 transition-colors duration-200 hover:bg-main-primary-dark`}
			onClick={onClick}
			disabled={disabled}
		>
			{text}
		</button>
	);
};

function LinkButton({ to, target, download, text, bgColor }) {
	return (
		<NavLink
			to={to}
			target={target}
			download={download}
			aria-label={`open ${to}`}
			className={`flex-center h-10 rounded-md uppercase my-2 px-4 transition ease-in-out duration-500 hover:bg-main-blue text-white ${bgColor ? bgColor : 'bg-main-blue/80'}`}
		>
			{text}
		</NavLink>
	);
}

function Switcher() {
	const [colorTheme, setTheme] = useDarkMode();
	const [darkMode, setDarkMode] = useState(
		colorTheme === "light" ? true : false
	);

	const toggleDarkMode = (checked) => {
		setTheme(colorTheme);
		setDarkMode(checked);
	};

	return (
		<div
			className="flex items-center animate-underline w-fit hover:animate-pulse"
			onClick={toggleDarkMode}
		>
			<div className="flex justify-center">
				<DarkModeSwitch
					checked={darkMode}
					onChange={toggleDarkMode}
					size={20}
				/>
			</div>
			{/* <span className='cursor-pointer'>Theme</span> */}
		</div>
	);
}

function ToggleButton({ activeToggle, title, onClick, children }) {
	const isActive = activeToggle === title;

	const containerClasses = `w-full ruby flex-col md:flex-row justify-between md:items-center cursor-pointer gap-1 no-seleccionable hover:text-[#003195] hover:dark:text-[#E0E0E0] transition-colors duration-500 ${isActive && "text-[#003195] dark:text-[#b2c1df]"
		}`;

	return (
		<li
			className={containerClasses}
			onClick={onClick}
			aria-expanded={isActive}
			aria-controls={`toggle-content-${title}`}
		>
			<span className="w-full flex justify-between ">
				<span className="w-max-content">{title}</span>
				<i className="flex items-center justify-center w-4 h-4 pt-1 md:pt-2 lg:pt-3">
					{isActive ? ICONS.plane.border('#000') : ICONS.plane.border('#000')}
				</i>
			</span>
			{isActive && (
				<>
					<span
						className={`md:absolute z-50 md:mt-[65px] left-0 top-0 md:py-2 md:px-4 w-full flex justify-center border-t-2 bg-main-light dark:border-[#5376d65f] dark:bg-[#000e2c] dark:text-[#b2c1df] ${isActive ? " animate-accordion-down " : " animate-accordion-up "
							}`}
					>
						<span
							className={`w-full max-w-screen-2xl px-1 ${isActive && " animate-fade-in "
								}`}
						>
							{children}
						</span>
					</span>
					<div
						className={`absolute -z-10 md:mt-[80px] left-0 top-0 md:py-2 md:px-4 w-full h-screen`}
					></div>
				</>
			)}
		</li>
	);
}

function LogOutButton() {
	const navigate = useNavigate();

	const handleLogout = () => {
		signOut(auth)
			.then(() => {
				// Sign-out successful.
				navigate("/");
				//console.log("Signed out successfully");
				window.location.reload();
			})
			.catch((error) => {
				// An error happened.
				//console.log("error");
			});
	};

	return (
		<button
			onClick={handleLogout}
			className="flex-center font-medium py-2 px-4 rounded-md text-main-light bg-main-blue"
		>
			<span className="uppercase hover:animate-pulse">
				Cerrar Sesión
			</span>
		</button>
	);
}

function FilterButton({ label, titleSectionOne, itemsSectionOne = [], titleSectionTwo, itemsSectionTwo = [] }) {
	const activatorRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState(null); // Para la sección 1
	const [selectedCategory, setSelectedCategory] = useState(null); // Para la sección 2

	const handleClickOutside = (event) => {
		if (activatorRef.current && !activatorRef.current.contains(event.target)) {
			setTimeout(() => {
				setIsOpen(false);
			}, "100");
		}
	};

	const handleEscape = (event) => {
		if (event.key === "Escape" && isOpen) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		if (isOpen) {
			document.body.classList.add("no-scroll");
		} else {
			document.body.classList.remove("no-scroll");
		}

		return () => {
			document.body.classList.remove("no-scroll");
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	});

	const handleSelectPeriod = (period) => {
		setSelectedPeriod(period);
	};

	const handleSelectCategory = (category) => {
		setSelectedCategory(category);
	};


	return (
		<div className={"inline-block"}>
			<button
				className={`h-fit p-4 rounded-3xl font-medium text-sm ml-2 my-1 text-main-dark ${!isOpen ? 'opacity-50' : 'opacity-100'} `}
				aria-haspopup="true"
				aria-controls={label}
				onClick={() => setIsOpen(!isOpen)}
				ref={activatorRef}
			>
				{label}
			</button>

			<div className={`absolute top-0 left-0 w-full h-screen z-[100] bg-main-dark/80 ${isOpen
				? "block"
				: "hidden"
				}`}>
				<div className="flex flex-col mt-24 p-4 rounded-md bg-[#eaebee] shadow-sm shadow-main-dark/30">
					<ul className="pb-2">
						<li className="py-2 font-semibold text-main-dark">{titleSectionOne}</li>

						{/* {itemsSectionOne.map((item, index) => {
							return (
								<li
									className={"text-sm"}
									key={index}
									onClick={() => setIsOpen(!isOpen)}
								>
									<button
										className="flex items-center gap-2 text-left w-full py-1 rounded-3xl text-main-dark hover:font-semibold"
										value={item.anchor}
										onClick={item.slug}
									>
										<i className="flex-center w-4 h-4">
											{item.icon}
										</i>
										{item.label}
									</button>
								</li>
							);
						})} */}
						{itemsSectionOne.map((item, index) => (
							<li className={"text-sm"} key={index}>
								<button
									className={`flex px-3 items-center gap-2 text-left w-fit py-1 rounded-3xl ${selectedPeriod === item.label
										? "border border-main-highlight/70 text-main-dark font-semibold"
										: "text-main-dark hover:font-semibold"
										}`}
									value={item.label}
									onClick={() => {
										item.slug(); // Ejecuta la acción asociada
										handleSelectPeriod(item.label);
									}}
								>
									<i className="flex-center w-4 h-4">{item.icon}</i>
									{item.label}
									{selectedPeriod === item.label &&
										<i className="flex-center w-4 h-4">{ICONS.tick.border('#00A86B')}</i>
									}
								</button>
							</li>
						))}
					</ul>

					<ul>
						<li className="py-2 font-semibold border-t border-main-dark/20 text-main-dark">{titleSectionTwo}</li>
						{itemsSectionTwo.map((item, index) => (
							<li className={"text-sm"} key={index}>
								<button
									className={`flex px-3 items-center gap-2 text-left w-fit py-1 rounded-3xl ${selectedCategory === item.anchor
										? "border border-main-highlight/70 text-main-dark font-semibold"
										: "text-main-dark hover:font-semibold"
										}`}
									value={item.anchor}
									onClick={() => {
										item.slug(); // Ejecuta la acción asociada
										handleSelectCategory(item.anchor);
									}}
								>
									<i className="flex-center w-4 h-4">{item.icon}</i>
									{item.label}
									{selectedCategory === item.anchor &&
										<i className="flex-center w-4 h-4">{ICONS.tick.border('#00A86B')}</i>
									}
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

function SwipeableCard({ context, data, onEdit, onDelete, expandedGastoId, onCardClick }) {
	const [swipeDistance, setSwipeDistance] = useState(0);
	const editThreshold = -50;   // Umbral para mostrar "Editar"
	const deleteThreshold = -150; // Umbral para mostrar "Eliminar"

	const handleTouchStart = (e) => {
		e.currentTarget.startX = e.touches[0].clientX;
	};

	const handleTouchMove = (e) => {
		const moveX = e.touches[0].clientX - e.currentTarget.startX;
		const maxSwipe = Math.max(Math.min(moveX, 0), deleteThreshold);
		setSwipeDistance(maxSwipe);
	};

	const handleTouchEnd = () => {
		if (swipeDistance <= deleteThreshold) {
			onDelete();
			setSwipeDistance(0);
		} else if (swipeDistance <= editThreshold) {
			onEdit();
			setSwipeDistance(0);
		} else {
			setSwipeDistance(0);
		}
	};

	return (
		<div className="relative flex items-center bg-main-dark/5 rounded-3xl overflow-hidden">
			<div
				className="relative w-full transition-transform duration-300 rounded-3xl"
				style={{
					transform: `translateX(${swipeDistance}px)`,
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div className={`flex justify-between items-center p-4 ${swipeDistance == -150 && 'w-11/12'}`}
					onClick={() => onCardClick(data.id)}>
					<span className="text-main-dark font-medium">{data.title}</span>
					<span className={`font-semibold ${data.gasto ? 'text-main-primary' : 'text-main-highlight'}`}>
						{data.gasto ? <>
							-{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.gasto)}
						</> : <>
							+{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.ingreso)}
						</>
						}
					</span>
				</div>
				{expandedGastoId === data.id && (
					<div className="px-4 pb-4 text-sm text-main-dark/60">
						{data.createdAt && (
							<p className="flex flex-col pb-2 border-b border-main-dark/20">
								<strong className="font-medium text-main-dark">Fecha</strong>
								{(data.createdAt instanceof Date
									? data.createdAt
									: data.createdAt.toDate()
								).toLocaleDateString()}
							</p>
						)}

						{data.remarks &&
							<p className="flex flex-col py-2 border-b border-main-dark/20">
								<strong className="font-medium text-main-dark">Notas</strong>
								{data.remarks}
							</p>
						}

						<div className="flex items-center pt-3 gap-2 flex-wrap">
							{data.type && (
								<p className="w-fit flex flex-col py-1 px-2 rounded-3xl text-main-light bg-main-highlight">
									{
										data.type.includes("card") && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.credit_card.border("#F5F6FA")}</i>
												{
													data.type == "card1" && context.paymentTypes.card1 ||
													data.type == "card2" && context.paymentTypes.card2 ||
													data.type == "cash" && "efectivo"
												}
											</span>
										) ||
										data.type.includes("cash") && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.money.border("#F5F6FA")}</i>
												{
													data.type == "cash" && "Efectivo"
												}
											</span>
										) ||
										data.type.includes("other") && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.bitcoin.border("#F5F6FA")}</i>
												{
													data.type == "other" && "Otro"
												}
											</span>
										)
									}
								</p>
							)}
							{data.category && (
								<p className="w-fit flex flex-col py-1 px-2 rounded-3xl text-main-light bg-main-primary">
									{
										data.category == "feeding" && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.restaurant.fill("#F5F6FA")}</i>
												Alimentación y Bebidas
											</span>
										) ||
										data.category == "transportation" && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.transportation.border("#F5F6FA")}</i>
												Transporte
											</span>
										) ||
										data.category == "personalCare" && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.beauty.border("#F5F6FA")}</i>
												Ropa y Cuidado Personal
											</span>
										) ||
										data.category == "entertainment" && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.theater_masks.border("#F5F6FA")}</i>
												Entretenimiento y Ocio
											</span>
										) ||
										data.category == "housing" && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.house.border("#F5F6FA")}</i>
												Vivienda
											</span>
										) ||
										data.category == "health" && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.care.border("#F5F6FA")}</i>
												Salud y Bienestear
											</span>
										) ||
										data.category == "educationJob" && (
											<span className="flex-center gap-1">
												<i className="w-4 h-4 flex-center">{ICONS.ruler.border("#F5F6FA")}</i>
												Educación o Trabajo
											</span>
										)
									}
								</p>
							)}
							{(data.image || data.fileURL) && (
								<NavLink
									to={data.image && data.image.imageURL || data.fileURL}
									target="_blank"
									className="w-fit flex-center gap-1 py-1 px-2 rounded-3xl text-main-light bg-main-dark"
								>
									<i className="w-4 h-4 flex-center">{ICONS.ticket.border("#F5F6FA")}</i>
									ticket
								</NavLink>
							)}
						</div>
					</div>
				)}
			</div>

			<div
				className={`absolute inset-y-0 bg-main-highlight/70 text-white flex items-center justify-center transition-all duration-300 ${swipeDistance == -150 ? 'right-1/4' : 'right-0'}`}
				style={{
					width: `${Math.abs(swipeDistance) >= Math.abs(editThreshold) ? "25%" : "0%"}`,
					opacity: Math.abs(swipeDistance) >= Math.abs(editThreshold) ? 1 : 0,
				}}
				onClick={onEdit}
			>
				Editar
			</div>

			<div
				className={`absolute inset-y-0 right-0 bg-main-primary/70 text-white flex items-center justify-center transition-all duration-300`}
				style={{
					width: `${Math.abs(swipeDistance) >= Math.abs(deleteThreshold) ? "25%" : "0%"}`,
					opacity: Math.abs(swipeDistance) >= Math.abs(deleteThreshold) ? 1 : 0,
				}}
				onClick={onDelete}
			>
				Eliminar
			</div>
		</div>
	);
}

export { ValidateButton, SimpleButton, LinkButton, ToggleButton, Switcher, LogOutButton, FilterButton, SwipeableCard };
