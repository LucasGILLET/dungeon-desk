import { test, expect } from '@playwright/test';

test('affiche les points d entree principaux sur l accueil', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: /Écrivez votre/i })).toBeVisible();
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
  // Nombre d'étapes variable (l'étape des choix dépend des données)
  await expect(page.getByText(/Étape 1\s*\/\s*\d+/i)).toBeVisible();
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
  // Le bouton s'active une fois les tables du générateur chargées
  const generate = page.getByRole('button', { name: /Generer|Générer/i });
  await expect(generate).toBeEnabled();
  await generate.click();
  await expect(page.getByText(/Profession/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Personnalite|Personnalité/i })).toBeVisible();
});

test('invite a se connecter sur le tableau de bord MJ', async ({ page }) => {
  await page.goto('/gm-dashboard');

  await expect(page.getByRole('heading', { name: /Tableau de bord MJ/i })).toBeVisible();
  await expect(page.getByText(/Connectez-vous pour créer et retrouver vos campagnes/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Se connecter/i })).toBeVisible();
});
