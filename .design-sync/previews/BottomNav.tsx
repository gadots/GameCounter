import { BottomNav } from 'gamecounter-scaffold';

// BottomNav is `position: fixed`. The `transform` on the wrapper makes it the
// containing block, so the fixed bar anchors to this box instead of the viewport
// and the card renders a measurable, non-blank region.
export const Default = () => (
  <div style={{ position: 'relative', width: 390, height: 60, transform: 'translateZ(0)' }}>
    <BottomNav />
  </div>
);
