import { Shield, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
    const location = useLocation()
    const from=  location?.state?.from?.pathname
    console.log(from)
    const navigate= useNavigate()

  const handleGoBack = () => {
     navigate(from)
  };

  const handleGoHome = () => {
     navigate("/")
  };

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Glass morphism card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Icon with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Shield className="w-10 h-10 text-red-400" />
              </div>
              <div className="absolute inset-0 w-20 h-20 border-2 border-red-400/30 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Error code */}
          <div className="text-center mb-4">
            <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">
              4<span className="text-red-400">0</span>1
            </h1>
            <h2 className="text-2xl font-semibold text-white/90 mb-2">
              Unauthorized Access
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              You don't have permission to access this resource. Please check your credentials or contact your administrator.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 mt-8">
            <button
              onClick={handleGoBack}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleGoHome}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-white/20 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              
              
            </div>
          </div>

          
        </div>

        {/* Floating particles */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-10 right-10 w-1 h-1 bg-purple-400/50 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-10 left-10 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;