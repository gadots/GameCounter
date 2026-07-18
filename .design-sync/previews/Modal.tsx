import { Modal } from 'gamecounter-scaffold';

// Modal renders a `position: fixed inset-0` overlay. The `transform` on the
// wrapper makes it the containing block so the backdrop + panel anchor inside
// this box instead of the iframe viewport, giving a self-contained card.
export const ConfirmDanger = () => (
  <div style={{ position: 'relative', width: 440, height: 340, transform: 'translateZ(0)', overflow: 'hidden' }}>
    <Modal
      open
      title="¿Borrar jugador?"
      description="Se eliminará a Jose junto con sus estadísticas. Esta acción no se puede deshacer."
      confirmLabel="Borrar"
      cancelLabel="Cancelar"
      confirmVariant="danger"
      onConfirm={() => {}}
      onCancel={() => {}}
    />
  </div>
);
