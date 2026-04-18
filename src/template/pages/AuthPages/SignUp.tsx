import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crear Cuenta | Faid"
        description="Crea tu cuenta en Faid y descubre el poder de la inteligencia artificial financiera."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
