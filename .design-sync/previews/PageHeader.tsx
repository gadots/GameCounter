import { PageHeader } from 'gamecounter-scaffold';

export const Root = () => (
  <div style={{ maxWidth: 390 }}>
    <PageHeader title="Librería" />
  </div>
);

export const DetailWithBack = () => (
  <div style={{ maxWidth: 390 }}>
    <PageHeader title="Catan" showBack />
  </div>
);

export const NoSettings = () => (
  <div style={{ maxWidth: 390 }}>
    <PageHeader title="Jugadores" showSettings={false} />
  </div>
);
