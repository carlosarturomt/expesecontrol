const Spinner = () => {
	return (
		<div
			className={`w-full h-screen absolute left-0 top-0 z-50 flex justify-center items-center rounded-md`}
		>
			<div className="w-16 h-16 relative block ">
				<span className="absolute w-full h-full border-t-4 border-t-main-highlight/70 rounded-full animate-spin"></span>
				<span className="absolute left-[0.3rem] top-[0.3rem] w-14 h-14 border-r-4 border-r-main-highlight rounded-full animate-spin-reverse"></span>
			</div>
		</div>
	);
}

export { Spinner };