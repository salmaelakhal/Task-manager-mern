import React, { useState } from 'react';

const AuthLayout = ({ children }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className='flex min-h-screen bg-white'>
      {/* Partie formulaire */}
      <div className="w-full md:w-[60vw] px-6 md:px-12 pt-8 pb-12 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600">TaskFlow</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Connexion
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inscription
            </button>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} TaskFlow. Tous droits réservés.
        </footer>
      </div>

      {/* Partie image avec overlay et texte */}
      <div className="hidden md:flex w-[50vw] h-screen items-center justify-center bg-blue-600 bg-[url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative">
        <div className="absolute inset-0 bg-blue-900/70"></div>
        <div className="relative z-10 text-white text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Boostez votre productivité</h1>
          <p className="text-lg mb-6">Gérez vos tâches efficacement avec notre application tout-en-un conçue pour les équipes modernes.</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;