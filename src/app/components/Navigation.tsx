import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, CreditCard } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
        <button
          onClick={() => navigate('/list')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/list')
              ? 'text-[#53BEE8]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">ホーム</span>
        </button>

        <button
          onClick={() => navigate('/search')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/search')
              ? 'text-[#53BEE8]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Search size={24} />
          <span className="text-xs mt-1">検索</span>
        </button>

        <button
          onClick={() => navigate('/flashcard')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/flashcard')
              ? 'text-[#53BEE8]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <CreditCard size={24} />
          <span className="text-xs mt-1">学習</span>
        </button>

        <button
          onClick={() => navigate('/add')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/add')
              ? 'text-[#53BEE8]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Plus size={24} />
          <span className="text-xs mt-1">追加</span>
        </button>
      </div>
    </nav>
  );
}