import { useNavigate } from 'react-router-dom';
import { Settings, ChevronLeft } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useTranslation } from '../../hooks/useTranslation';

interface PageHeaderProps {
  title: string;
  backPath?: string;
  showSettings?: boolean;
}

export function PageHeader({ title, backPath, showSettings = true }: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2.5 pt-1 flex-1 min-w-0">
      {backPath ? (
        <button
          onClick={() => navigate(backPath)}
          className="p-1.5 -ml-1.5 rounded-xl text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800 transition-colors shrink-0"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={22} />
        </button>
      ) : (
        <Logo size={30} />
      )}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 truncate">{title}</h1>
      {showSettings && (
        <button
          onClick={() => navigate('/settings')}
          className="p-2 -mr-2 rounded-xl text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-gray-800 transition-colors shrink-0"
          aria-label={t('common.settings')}
        >
          <Settings size={20} />
        </button>
      )}
    </div>
  );
}
