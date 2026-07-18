import { Logo } from 'gamecounter-scaffold';

export const Default = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <Logo />
    <span className="text-xl font-bold text-gray-900 dark:text-white">GameCounter</span>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <Logo size={20} />
    <Logo size={30} />
    <Logo size={48} />
    <Logo size={64} />
  </div>
);
