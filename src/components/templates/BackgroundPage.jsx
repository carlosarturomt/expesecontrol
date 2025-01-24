import { ICONS } from "@assets/icons";

const BackgroundPage = ({ children }) => {
    return (
        <main className="relative w-full h-screen p-3 flex flex-col justify-center items-center bg-primary-light">
            <section className="w-full h-auto max-w-screen-sm flex flex-col justify-center items-center gap-4">
                <header className="w-full flex flex-col items-center">
                    <i className="w-[66px] h-[66px] flex justify-center items-center">
                        {ICONS.logo.exco()}
                    </i>
                    <div className="text-left">
                        <h2 className="leading-5 text-2xl font-bold text-primary-nightshade">Exco</h2>
                        <p className="text-primary-nightshade">Control Financiero</p>
                    </div>
                </header>

                <article className="w-full h-auto flex justify-center items-center">
                    {children}
                </article>
            </section>
        </main>

    )
}

export { BackgroundPage }