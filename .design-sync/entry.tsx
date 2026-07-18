// Design-system barrel entry for design-sync.
// Exports ONLY the reusable UI/layout components (not the app's pages or main.tsx),
// so the converter bundles a clean design system rather than the whole app.
export { Button } from '../src/components/ui/Button';
export { Card } from '../src/components/ui/Card';
export { Modal } from '../src/components/ui/Modal';
export { Logo } from '../src/components/ui/Logo';
export { InputRenderer } from '../src/components/ui/InputRenderer';
export { PageHeader } from '../src/components/layout/PageHeader';
export { BottomNav } from '../src/components/layout/BottomNav';

// Provider used to render previews that need react-router context
// (PageHeader/BottomNav call useNavigate / render NavLink). Wrapping the
// other components in it is harmless.
export { MemoryRouter } from 'react-router-dom';
