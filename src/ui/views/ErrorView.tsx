import { useNavigate } from 'react-router-dom';

export const ErrorView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <h1 className="text-2xl text-red-400">Error de conexión</h1>
      <button
        onClick={() => navigate('/')}
        className="bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg"
      >
        Volver al Inicio
      </button>
    </div>
  );
};