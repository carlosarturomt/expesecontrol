import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@services/firebase/config";
import emailjs from "emailjs-com";
/* assets */
import { ICONS } from "@assets/icons";

const ChatBot = () => {
    const [step, setStep] = useState(0); // Controla el flujo del chatbot
    const [userInput, setUserInput] = useState("");
    const [userData, setUserData] = useState({
        email: "",
        displayName: "",
        pronoun: "",
    });
    const [messages, setMessages] = useState([
        { text: "¡Ey, Hola! Soy Exco Bot 👋", sender: "bot" },
        { text: "Parce que no recuerdas tu contraseña :(", sender: "bot" },
        { text: "¡Pero no te preocupes, tal vez puedo ayudarte! Por favor, dime cuál es tu correo electrónico.", sender: "bot" },
    ]);
    const [isTyping, setIsTyping] = useState(false); // Simula que el bot está escribiendo
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        // Hacer scroll hasta el final cuando los mensajes cambian
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);  // Se ejecuta cuando los mensajes cambian

    const handleInput = async (e) => {
        e.preventDefault();
        const userMessage = userInput.trim();
        if (!userMessage) return;

        // Agrega el mensaje del usuario al chat
        setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
        setUserInput("");

        // Simula que el bot está escribiendo
        setIsTyping(true);

        // Espera 2 segundos antes de procesar la respuesta del bot
        setTimeout(async () => {
            await processBotResponse(userMessage);
            setIsTyping(false);
        }, 1000);
    };

    const processBotResponse = async (userMessage) => {
        let botMessage = "";

        // Lista de palabras clave que indican el final de la conversación
        const thankYouKeywords = ["gracias", "muchas gracias", "thanks", "thank you", "gracias por todo", "thank you very much", "genial"];

        // Comprobar si el mensaje contiene alguna palabra clave de agradecimiento
        const isThankYouMessage = thankYouKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

        if (isThankYouMessage) {
            botMessage = [
                { text: "¡Fue un placer ayudarte! 😊", sender: "bot" },
                { text: "Si necesitas algo más, no dudes en volver. ¡Hasta pronto! 👋", sender: "bot" }
            ];
        } else {

            if (step === 0) {
                // Validar correo
                const email = userMessage.toLowerCase();
                const userAuthRef = collection(db, "userAuth");

                try {
                    const emailQuery = query(userAuthRef, where("email", "==", email));
                    const querySnapshot = await getDocs(emailQuery);

                    if (!querySnapshot.empty) {
                        const userSnapshot = querySnapshot.docs[0];
                        const data = userSnapshot.data();
                        setUserData((prev) => ({ ...prev, email }));

                        if (data.providerId === "google.com") {
                            botMessage = [
                                { text: "Parece que tu cuenta está vinculada con Google. ", sender: "bot" },
                                { text: "Por favor, inicia sesión con Google. 👌", sender: "bot" },
                                { text: "Un placer haberte servido. 🫡", sender: "bot" }
                            ];
                        } else {
                            setStep(1);
                            botMessage = [
                                { text: "¡Súper! Tu correo es válido.", sender: "bot" },
                                { text: "Ahora, por seguridad a tus datos, por favor dime tu nombre completo.", sender: "bot" },
                            ];
                        }
                    } else {
                        botMessage = [{ text: "Uy! Los siento, no encontré una cuenta con este correo. Inténtalo de nuevo.", sender: "bot" }];
                    }
                } catch (error) {
                    console.error("Error al buscar el usuario:", error);
                    botMessage = [{ text: "Ocurrió un error al validar el correo. Por favor, inténtalo más tarde.", sender: "bot" }];
                }
            }
            else if (step === 1) {
                setUserData((prev) => ({ ...prev, displayName: userMessage }));
                setStep(2);
                botMessage = [
                    { text: "Perfecto! Te mandaré un correo con tu contraseña Ok?", sender: "bot" },
                    { text: "Si estas de acuerdo, puedes decierme ok, o algo así, gracias no porque pensaré que ya no me necesitas jaja", sender: "bot" }
                ];
            } else if (step === 2) {
                // Omitir paso de pronombre, continuar con la actualización y el correo
                await saveUserData();
                botMessage = [
                    { text: "Gracias por tu información.", sender: "bot" },
                    { text: `Un placer haberte servido, ${userData.displayName}. ¡Todo está listo!`, sender: "bot" },
                    { text: "Te he enviado un correo con los datos para que puedas iniciar sesión. 👌", sender: "bot" }
                ];
            }
        }

        // Mostrar los mensajes del bot
        showBotMessages(botMessage);
    };

    const showBotMessages = (botMessages) => {
        botMessages.forEach((msg, index) => {
            setIsTyping(true);
            setIsTyping(false);
            setMessages((prev) => [...prev, msg]);
        });
    };

    const saveUserData = async () => {
        const { email, displayName } = userData;

        // Verifica si el email o el nombre de usuario están vacíos
        if (!email || !displayName) {
            console.error("El correo electrónico o el nombre de usuario están vacíos.");
            return;
        }

        try {
            // Crear una consulta para buscar el documento con el email correspondiente
            const userAuthRef = collection(db, "userAuth");
            const emailQuery = query(userAuthRef, where("email", "==", email));
            const querySnapshot = await getDocs(emailQuery);

            if (querySnapshot.empty) {
                console.error("No se encontró el usuario en la base de datos.");
                return;
            }

            // Obtener los datos del primer documento que coincida
            const userAuthDoc = querySnapshot.docs[0];
            const userPassword = userAuthDoc.data().password;

            // Enviar el correo
            const emailData = {
                userEmail: email,
                userName: displayName,
                userPassword: userPassword,  // Enviar la contraseña recuperada
            };

            await emailjs.send(
                "default_service",
                "template_bo6p59m",
                emailData,
                "azTak9o8ZPGEfE2-N"
            );

            console.log("Datos del usuario guardados y correo enviado.");
        } catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-end overflow-y-auto" ref={chatContainerRef}>
            <div className="flex flex-col gap-2 p-4 text-lg mb-16 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`w-fit max-w-[80%] p-4 rounded-lg ${msg.sender === "bot"
                            ? "bg-primary-nightshade/20 text-primary-nightshade rounded-r-3xl rounded-bl-3xl"
                            : "bg-main-highlight/70 text-white rounded-l-3xl rounded-br-3xl self-end"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}
                {isTyping && (
                    <div className="w-fit max-w-[80%] pt-3 pb-4 px-4 rounded-lg flex-center gap-1 bg-primary-nightshade/20 text-primary-nightshade rounded-r-3xl rounded-bl-3xl">
                        <span className="animate-bounce h-4" style={{ animationDelay: "0s" }}>•</span>
                        <span className="animate-bounce h-4" style={{ animationDelay: "0.1s" }}>•</span>
                        <span className="animate-bounce h-4" style={{ animationDelay: "0.2s" }}>•</span>
                    </div>

                )}
                {/* Ref para el scroll al final */}
                <div ref={messagesEndRef} />
            </div>

            {step < 4 && (
                <form onSubmit={handleInput} className="bg-main-dark/50 flex-center gap-2 p-3 pb-6 absolute bottom-0 w-full backdrop-blur">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Aa"
                        required
                        className="rounded-full py-1 px-3 w-full text-lg outline-none text-primary-nightshade"
                    />
                    <button type="submit">
                        <i className="flex-center w-8 h-8">
                            {ICONS.send.fill("#212121")}
                        </i>
                    </button>
                </form>
            )}
        </div>
    );
}

export default ChatBot;
