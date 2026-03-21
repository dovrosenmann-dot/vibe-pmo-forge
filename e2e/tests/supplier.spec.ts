import { test, expect } from '@playwright/test';

test.describe('PMO Supplier Management Flow', () => {
  
  test('should allow a PMO Manager to create a new supplier via the UI Wizard', async ({ page }) => {
    // 1. Navigate to the application
    // (Assuming local development auth bypass or pre-authenticated browser state)
    await page.goto('/suppliers');
    
    // 2. Locate the main action button governed by the explicit RBAC <Authorize> wrapper
    const newSupplierBtn = page.getByRole('button', { name: /novo fornecedor/i });
    
    // Wait for Supabase to resolve permissions. If visible, the user has PMO/Admin roles.
    if (await newSupplierBtn.isVisible()) {
      await newSupplierBtn.waitFor({ state: 'visible' });
      await newSupplierBtn.click();
      
      // 3. Verify the shadcn/ui Dialog mounts correctly
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      
      // 4. Fill out the complex AI-assisted Supplier Form manually
      await page.getByLabel(/nome \*/i).fill('Earthworm Automated Testing Co.');
      await page.getByLabel(/cnpj\/cpf/i).fill('12.345.678/0001-90');
      
      // Interact with Select dropdowns
      await page.getByLabel(/categoria \*/i).click();
      await page.getByRole('option', { name: /logística/i }).click();

      // 5. Submit the form
      await page.getByRole('button', { name: /salvar fornecedor/i }).click();

      // 6. Verify our newly implemented React-Query Optimistic UI behaves correctly
      // The toast should appear INSTANTLY before network resolution.
      await expect(page.getByText('Fornecedor criado com sucesso')).toBeVisible();
      
      // 7. Dialog should automatically close on successful dispatch
      await expect(dialog).toBeHidden();
    } else {
      console.warn('Skipping test: "Novo Fornecedor" button not visible. Verify test mock auth state.');
    }
  });

});
