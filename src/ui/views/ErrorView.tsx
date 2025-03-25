import { useNavigate } from 'react-router-dom';

export const ErrorView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Contenedor interno para centrar texto y elementos */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl text-red-400">Error de conexión</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-spotify-green to-[#1DB954] px-6 py-2 rounded-full text-white font-medium flex items-center gap-2 transition-transform hover:scale-105 mx-auto"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};