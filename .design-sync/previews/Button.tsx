import { Button } from 'gamecounter-scaffold';

export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <Button variant="primary">Nueva partida</Button>
    <Button variant="secondary">Ver historial</Button>
    <Button variant="ghost">Cancelar</Button>
    <Button variant="danger">Borrar jugador</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Button size="sm">Pequeño</Button>
    <Button size="md">Mediano</Button>
    <Button size="lg">Grande</Button>
  </div>
);

export const Disabled = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Button variant="primary" disabled>Guardar</Button>
    <Button variant="danger" disabled>Eliminar</Button>
  </div>
);

export const FullWidth = () => (
  <div style={{ maxWidth: 320 }}>
    <Button variant="primary" className="w-full">Registrar ronda</Button>
  </div>
);
