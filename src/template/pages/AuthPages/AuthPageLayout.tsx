import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { BRAND } from "../../../config/branding";
import { useTheme } from "../../context/ThemeContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? BRAND.logoText : BRAND.logoTextLight;
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div 
          className="items-center hidden w-full h-full lg:w-1/2 lg:grid relative"
          style={{ backgroundImage: "url('/images/logo/background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-brand-950/80 dark:bg-gray-900/80 z-0"></div>
          <div className="relative flex items-center justify-center z-1 w-full h-full">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-md px-6">
              <Link to="/" className="block mb-6 flex justify-center w-full">
                <img
                  className="w-full max-w-[230px] object-contain"
                  src={logoSrc}
                  alt={BRAND.logoAlt}
                />
              </Link>
              <p className="text-center text-gray-400 dark:text-white/70 text-sm md:text-base leading-relaxed">
                Tu Asesor Financiero Virtual. Descubre la forma más inteligente de gestionar tu patrimonio, optimizar tus gastos e invertir con el poder de la Inteligencia Artificial.
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
