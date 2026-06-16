import { test, expect } from '@playwright/test';

// Seed helpers — called after page.goto('/') so the app has loaded once,
// then we inject data into localStorage before reloading.
async function seedInstalledGames(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem(
      'gc_installed_games',
      JSON.stringify([
        { game_id: 'catan', installed_at: '2024-01-01T00:00:00.000Z', is_favorite: false },
      ])
    );
  });
}

async function seedPlayers(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem(
      'gc_players',
      JSON.stringify([
        { id: 'p1', name: 'Ana',    color: '#6366f1', avatar_emoji: '🎲', created_at: '2024-01-01T00:00:00.000Z' },
        { id: 'p2', name: 'Bob',    color: '#ec4899', avatar_emoji: '🏆', created_at: '2024-01-01T00:00:00.000Z' },
        { id: 'p3', name: 'Carlos', color: '#f59e0b', avatar_emoji: '⭐', created_at: '2024-01-01T00:00:00.000Z' },
      ])
    );
  });
}

async function clearStorage(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.removeItem('gc_players');
    localStorage.removeItem('gc_sessions');
    localStorage.removeItem('gc_installed_games');
    localStorage.removeItem('gc_settings');
  });
}

// ─── Flow 1: App loads ────────────────────────────────────────────────────────

test('home page loads and redirects to library', async ({ page }) => {
  await page.goto('/');
  // The root redirects to /library
  await expect(page).toHaveURL(/\/library/);
  // Body is not empty
  await expect(page.locator('body')).not.toBeEmpty();
  // Library heading is visible
  await expect(page.getByText('Librería de juegos')).toBeVisible();
});

// ─── Flow 2: Install a game from Library ─────────────────────────────────────

test('can install a game from the Library tab', async ({ page }) => {
  await page.goto('/library');
  // Clear any previously installed games so we start fresh
  await clearStorage(page);
  await page.reload();

  // Switch to "Todos" tab to see all available games
  await page.getByText(/^Todos/).click();

  // Find Catan and install it — click the "+ Instalar" button
  const installBtn = page.getByRole('button', { name: /\+ Instalar/ }).first();
  await expect(installBtn).toBeVisible();
  await installBtn.click();

  // After install, the button should now show "Jugar" (and "Quitar")
  await expect(page.getByRole('button', { name: 'Jugar' }).first()).toBeVisible();
});

// ─── Flow 3: Add a player ────────────────────────────────────────────────────

test('can add a player on the Players page', async ({ page }) => {
  await page.goto('/players');
  await clearStorage(page);
  await page.reload();

  // Fill in the player name field
  const nameInput = page.getByPlaceholder('Nombre del jugador');
  await expect(nameInput).toBeVisible();
  await nameInput.fill('María');

  // Click Agregar
  await page.getByRole('button', { name: 'Agregar' }).click();

  // Verify the player appears in the list
  await expect(page.getByText('María')).toBeVisible();
});

// ─── Flow 4: Start and finish a session (happy path) ─────────────────────────

test('can start a session and reach the winner screen', async ({ page }) => {
  await page.goto('/');

  // Seed data: install Catan + 3 players (Catan requires 3-4)
  await clearStorage(page);
  await seedInstalledGames(page);
  await seedPlayers(page);
  await page.reload();

  // Go to New Session via nav
  await page.getByRole('link', { name: 'Jugar' }).click();
  await expect(page).toHaveURL(/\/session\/new/);

  // Select game: Catan — click the card containing "Catan" text
  await page.getByText('Catan', { exact: true }).click();

  // Select all 3 players
  await page.getByText('Ana', { exact: true }).click();
  await page.getByText('Bob', { exact: true }).click();
  await page.getByText('Carlos', { exact: true }).click();

  // Click "Empezar partida"
  const startBtn = page.getByRole('button', { name: 'Empezar partida' });
  await expect(startBtn).toBeEnabled();
  await startBtn.click();

  // Verify we navigated to the session page
  await expect(page).toHaveURL(/\/session\/.+/);
  // Game name visible in the heading
  await expect(page.locator('h1').filter({ hasText: 'Catan' })).toBeVisible();

  // Catan is end_of_game mode with target_score=10.
  // Enter scores for each player. We give Ana enough VP to reach 10 and trigger auto-end.
  // Inputs: settlements (stepper), cities (stepper), longest_road (toggle),
  //         largest_army (toggle), vp_cards (stepper).
  // Strategy: Ana gets 5 settlements (5VP) + 1 city (2VP) + vp_cards=3 (3VP) = 10VP → wins

  // Helper: click a stepper "+" button for a given input label N times.
  // The layout is: label text in a <span>, stepper in a sibling div with − value + buttons.
  // We find the row by locating the label text, then get the parent flex row,
  // and click the "+" button (text content "+") within it.
  async function stepperIncrement(label: string, times: number) {
    // Each input row is a flex div with the label span and stepper on the right.
    // Locate the label text element, go up to its row container.
    const labelEl = page.getByText(label, { exact: true });
    // The stepper + button is a type="button" with text "+" in the same row.
    // We locate it via the ancestor div that contains both label and stepper.
    const row = labelEl.locator('xpath=ancestor::div[contains(@class,"flex") and contains(@class,"items-center") and contains(@class,"justify-between")]');
    for (let i = 0; i < times; i++) {
      await row.getByRole('button', { name: '+' }).click();
    }
  }

  // --- Ana's inputs ---
  await stepperIncrement('Asentamientos', 5);  // 5 VP
  await stepperIncrement('Ciudades', 1);       // 2 VP
  await stepperIncrement('Cartas de Punto de Victoria', 3); // 3 VP → total 10

  // Submit Ana → advances to Bob
  let submitBtn = page.getByRole('button', { name: /Siguiente:|Registrar|Calcular/ });
  await submitBtn.click();

  // --- Bob's inputs (all zeros, defaults) ---
  submitBtn = page.getByRole('button', { name: /Siguiente:|Registrar|Calcular/ });
  if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await submitBtn.click();
  }

  // --- Carlos's inputs (all zeros, defaults) ---
  submitBtn = page.getByRole('button', { name: /Siguiente:|Registrar|Calcular/ });
  if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await submitBtn.click();
  }

  // After all players submit, the game should auto-end because Ana reached 10VP.
  // Expect winner screen: "¡Ganó Ana!" or "¡Empate!"
  await expect(page.getByText(/¡Ganó|¡Empate/).first()).toBeVisible({ timeout: 5000 });
});

// ─── Flow 5: Navigation works ─────────────────────────────────────────────────

test('bottom navigation switches between pages', async ({ page }) => {
  await page.goto('/');

  // Verify Library tab
  await page.getByRole('link', { name: 'Librería' }).click();
  await expect(page).toHaveURL(/\/library/);
  await expect(page.getByRole('heading', { name: 'Librería de juegos' })).toBeVisible();

  // Navigate to Jugadores
  await page.getByRole('link', { name: 'Jugadores' }).click();
  await expect(page).toHaveURL(/\/players/);
  await expect(page.getByRole('heading', { name: 'Jugadores' })).toBeVisible();

  // Navigate to Historial
  await page.getByRole('link', { name: 'Historial' }).click();
  await expect(page).toHaveURL(/\/history/);

  // Navigate back to Jugar
  await page.getByRole('link', { name: 'Jugar' }).click();
  await expect(page).toHaveURL(/\/session/);
});

// ─── Flow 6: Library search filters games ────────────────────────────────────

test('library search filters the game list', async ({ page }) => {
  await page.goto('/library');

  // Switch to "Todos" to see all games
  await page.getByText(/^Todos/).click();

  // Type in the search box
  const searchInput = page.getByPlaceholder('Buscar juego...');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('Catan');

  // Should show Catan
  await expect(page.getByText('Catan', { exact: true })).toBeVisible();
  // Azul should not be visible
  await expect(page.getByText('Azul', { exact: true })).not.toBeVisible();
});

// ─── Flow 7: Session page shows game and player info ─────────────────────────

test('session page shows game name and player tabs when seeded via localStorage', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);
  await seedInstalledGames(page);
  await seedPlayers(page);
  await page.reload();

  // Navigate to new session
  await page.goto('/session/new');

  // Select Catan
  await page.getByText('Catan', { exact: true }).click();

  // Select Ana, Bob, Carlos
  await page.getByText('Ana', { exact: true }).click();
  await page.getByText('Bob', { exact: true }).click();
  await page.getByText('Carlos', { exact: true }).click();

  // Start the session
  await page.getByRole('button', { name: 'Empezar partida' }).click();

  // Verify session page loaded
  await expect(page).toHaveURL(/\/session\/.+/);
  // Game name visible in heading
  await expect(page.locator('h1').filter({ hasText: 'Catan' })).toBeVisible();
  // Player chip tabs should be visible in the session (the round-pill player selector)
  // They are rendered as buttons with emoji + name, e.g. "🎲 Ana"
  await expect(page.getByRole('button', { name: /🎲 Ana/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /🏆 Bob/ })).toBeVisible();
});
