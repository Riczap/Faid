import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar Sesión | Faid"
        description="Inicia sesión en tu Asesor Financiero Virtual Faid para gestionar tu patrimonio."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
