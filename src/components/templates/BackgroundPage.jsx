import { ICONS } from "@assets/icons";

const BackgroundPage = ({ children }) => {
    return (
        <section className="relative w-full h-full flex items-center flex-col overflow-hidden">
            <header className="w-full h-[50vh] flex-center flex-col">
                <hgroup className="w-full h-full text-center flex-center items-start gap-1 mb-20">
                    <i className="w-[66px] h-[66px] flex-center">
                        {ICONS.logo.exco()}
                    </i>
                    <div className="text-left">
                        <h2 className="flex flex-col justify-center items-start leading-5 text-2xl font-bold text-primary-nightshade">Exco</h2>
                        <p className="w-full text-primary-nightshade">Control de Gastos</p>
                    </div>
                </hgroup>
            </header>


            <article className="w-full h-[50vh] flex-center">
                {children}
            </article>
        </section>
    )
}

export { BackgroundPage }