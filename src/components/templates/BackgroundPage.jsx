import { ICONS } from "@assets/icons";

const BackgroundPage = ({ children }) => {
    return (
        <section className="relative w-full h-full flex items-center flex-col bg-main-dark/5">
            <header className="w-full h-[44vh] flex-center flex-col bg-main-highlight/70">
                <hgroup className="text-center flex-center gap-1 my-3">
                    <i className="w-[66px] h-[66px] rounded-full flex-center bg-main-light/70 border-2 border-main-highlight">
                        {ICONS.logo.expenseControl("#00A86B")}
                    </i>
                    <h2 className="flex flex-col justify-center items-start leading-5 uppercase text-2xl text-border-highlight font-bold text-main-light/90">Expense<span className="font-black">Control</span></h2>
                </hgroup>
                <p className="px-12 text-center text-lg font-medium text-main-light/90">Consumos responsables para Gestión Financiera</p>
            </header>
            <span className="w-[120%] h-40 bg-main-highlight/70 rounded-b-[100%]"></span>
            {children}
        </section>
    )
}

export { BackgroundPage }