import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../service/Axios';
import { FiEye, FiEyeOff, FiLoader, FiArrowRight, FiGlobe, FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const FEATURES = [
  "Centralisez vos réservations hôtel, billets et dossiers clients en un seul endroit.",
  "Automatisez vos devis et suivez vos commissions en temps réel.",
  "Front Office et Back Office synchronisés instantanément."
];

function LoginPage() {
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const loginResponse = await axiosInstance.post('/auth/login', {
        nom: nom.trim(),
        motDePasse: password.trim(),
      });
      const { access_token, refresh_token } = loginResponse.data.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      login({ token: access_token });
      navigate('/client-info', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.');
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-white">

      {/* ── GAUCHE : Formulaire ── */}
      <div className="flex-1 flex flex-col justify-between px-8 py-10 lg:px-16 lg:py-12 max-w-full ">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
            <FiGlobe className="text-white" size={18} />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Al Bouraq</span>
        </div>

        {/* Form zone */}
        <div className="mt-12 p-50 lg:mt-0">
          <p className="text-sm text-gray-400 font-medium mb-1">Bienvenue sur</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Al Bouraq</h1>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nom d'utilisateur */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value.replace(/\s/g, ''))}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-11"
                  required
                />
                {nom.length > 0 && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiCheck size={11} className="text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                    rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                  }`}
                >
                  {rememberMe && <FiCheck size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs text-gray-500">Se souvenir de moi</span>
              </label>
              <button type="button" className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Mot de passe oublié ?
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-lg">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Bouton LOGIN */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-lg font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200 mt-1"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  Connexion...
                </>
              ) : (
                <>
                  Connexion
                  <FiArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Support WhatsApp */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-lg flex items-center justify-center gap-2.5 hover:bg-green-50 hover:border-green-300 transition-all text-sm font-medium">
            <FaWhatsapp size={17} className="text-green-500" />
            Contacter le support
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-10 lg:mt-0">
          FAQ | Fonctionnalités | Support
        </p>
      </div>

      {/* ── DROITE : Panneau bleu avec forme organique ── */}
      <div className="hidden lg:flex lg:w-[35%] relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 overflow-hidden">

        {/* Forme blanche organique sur le bord gauche */}
        <div
          className="absolute left-0 top-0 h-full w-16 bg-white"
          style={{ clipPath: 'ellipse(100% 52% at 0% 50%)' }}
        />

        {/* Cercles décoratifs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-400/30 rounded-full" />
        <div className="absolute -bottom-10 -right-8 w-44 h-44 bg-blue-700/30 rounded-full" />
        <div className="absolute bottom-28 right-16 w-20 h-20 bg-white/10 rounded-full" />

        {/* Contenu texte — padding réduit et texte plus compact */}
        <div className="relative z-10 flex flex-col justify-center px-10 pl-20 py-12">

          <h2 className="text-2xl font-extrabold text-white mb-3 leading-snug">
            À propos d'Al Bouraq
          </h2>
          <p className="text-blue-100 text-xs leading-relaxed mb-7">
            Plateforme de gestion tout-en-un dédiée aux agences de voyage professionnelles. Simplifiez vos opérations et offrez une expérience client irréprochable.
          </p>

          <h3 className="text-sm font-bold text-white mb-3">Fonctionnalités</h3>
          <ul className="space-y-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </span>
                <p className="text-blue-100 text-xs leading-relaxed">{f}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Illustration SVG en bas */}
        <div className="absolute bottom-0 right-0 left-0 flex items-end justify-end px-4 pb-0 pointer-events-none select-none">
          <svg viewBox="0 0 500 160" className="w-full opacity-20" fill="none">
            <ellipse cx="250" cy="155" rx="260" ry="18" fill="white" />
            <rect x="320" y="90" width="70" height="65" fill="white" />
            <polygon points="310,90 460,90 390,45" fill="white" opacity="0.8" />
            <rect x="140" y="115" width="8" height="40" fill="white" />
            <ellipse cx="144" cy="105" rx="22" ry="28" fill="white" opacity="0.7" />
            <rect x="470" y="120" width="6" height="35" fill="white" />
            <ellipse cx="473" cy="112" rx="16" ry="20" fill="white" opacity="0.7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;