import useAuthRequired from "@hooks/useAuthRequired";
import { BackgroundPage } from "@components/templates/BackgroundPage";
import { Register } from "@components/organisms/auth/Register";
import { Spinner } from "@components/atoms/Spinner";

const RegisterPage = () => {
	const { isLoading, isAuthenticated } = useAuthRequired("/register", "/");

	if (isLoading) {
		return <Spinner bgTheme={true} />;
	}

	if (isAuthenticated) {
		return null;
	}

	return (
		<BackgroundPage>
			<Register />
		</BackgroundPage>
	);
}

export default RegisterPage;
