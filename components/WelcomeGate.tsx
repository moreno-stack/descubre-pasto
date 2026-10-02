import { ArrowRight, LogIn, Mountain, UserRoundPlus } from "lucide-react";

export function WelcomeGate({
  onSignIn,
  onRegister,
  onGuest,
}: {
  onSignIn: () => void;
  onRegister: () => void;
  onGuest: () => void;
}) {
  return (
    <main className="welcome-gate">
      <div className="welcome-landscape" aria-hidden="true" />
      <header className="welcome-header">
        <span className="brand-mark"><Mountain size={21} /></span>
        <span className="brand-name">DESCUBRE <span>PASTO</span></span>
      </header>
      <section className="welcome-content">
        <p className="eyebrow">CULTURA · HISTORIA · SABORES</p>
        <h1>Tu próxima historia empieza en Pasto.</h1>
        <p className="welcome-copy">Entra para guardar tus lugares y crear recorridos a tu manera.</p>
        <div className="welcome-actions">
          <button className="primary-button welcome-primary" onClick={onSignIn}><LogIn size={17} /> Iniciar sesión</button>
          <button className="welcome-register" onClick={onRegister}><UserRoundPlus size={17} /> Crear cuenta</button>
        </div>
        <button className="welcome-guest" onClick={onGuest}>Explorar como visitante <ArrowRight size={15} /></button>
      </section>
      <p className="welcome-location">Pasto, Nariño · Colombia</p>
    </main>
  );
}
