import { test, expect } from '@playwright/test';

test('affiche les points d entree principaux sur l accueil', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /DungeonDesk/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Creer un Personnage|Créer un Personnage/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Aide de Combat/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Tableau de Bord MJ/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Generateur de PNJ|Générateur de PNJ/i })).toBeVisible();
});

test('navigue vers le createur de personnage', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Creer un Personnage|Créer un Personnage/i }).click();

  await expect(page).toHaveURL(/\/character-creator/);
  await expect(page.getByRole('heading', { name: /Choisissez votre Race/i })).toBeVisible();
  await expect(page.getByText(/Etape 1\s*\/\s*9|Étape 1\s*\/\s*9/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Suivant/i })).toBeDisabled();
});

test('ouvre et ferme le detail action dans l aide de combat', async ({ page }) => {
  await page.goto('/combat-cheat-sheet');

  await expect(page.getByRole('heading', { name: /Combat/i })).toBeVisible();
  await page.getByRole('button', { name: /⚔️\s*Action\s*⚔️/i }).click();
  await expect(page.getByRole('heading', { name: /Action Principale/i })).toBeVisible();
  await page.getByRole('button', { name: /Retour/i }).click();
  await expect(page.getByRole('heading', { name: /Action Principale/i })).not.toBeVisible();
});

test('genere un PNJ depuis le generateur', async ({ page }) => {
  await page.goto('/npc-generator');

  await expect(page.getByRole('heading', { name: /Generateur de PNJ|Générateur de PNJ/i })).toBeVisible();
  await page.getByRole('button', { name: /Generer|Générer/i }).click();
  await expect(page.getByText(/Profession/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Personnalite|Personnalité/i })).toBeVisible();
});

test('retourne a l accueil depuis le dashboard MJ', async ({ page }) => {
  await page.goto('/gm-dashboard');

  await expect(page.getByRole('heading', { name: /Zone Interdite/i })).toBeVisible();
  await page.getByTitle("Retour à l'accueil").click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /DungeonDesk/i })).toBeVisible();
});
