import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, CreditCard } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 z-20">
      <div className="max-w-4xl mx-auto flex justify-around items-center h-16 pb-safe">
        <button
          onClick={() => navigate('/list')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/list')
              ? 'text-[#53BEE8]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home size={26} strokeWidth={isActive('/list') ? 2 : 1.5} />
        </button>

        <button
          onClick={() => navigate('/search')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/search')
              ? 'text-[#53BEE8]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search size={26} strokeWidth={isActive('/search') ? 2 : 1.5} />
        </button>

        <button
          onClick={() => navigate('/flashcard')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/flashcard')
              ? 'text-[#53BEE8]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard size={26} strokeWidth={isActive('/flashcard') ? 2 : 1.5} />
        </button>

        <button
          onClick={() => navigate('/add')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/add')
              ? 'text-[#53BEE8]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus size={26} strokeWidth={isActive('/add') ? 2 : 1.5} />
        </button>
      </div>
    </nav>
  );
}
