import { test, expect } from '@playwright/test'

test.describe('Job Radar Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/radar')
  })

  test('should display dashboard with hot jobs section', async ({ page }) => {
    await expect(page.locator('[data-testid="hot-jobs-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="job-card"]')).toHaveCount(20)
  })

  test('should display skills gap analysis', async ({ page }) => {
    await page.click('[data-testid="skills-tab"]')
    await expect(page.locator('[data-testid="skills-analysis"]')).toBeVisible()
    await expect(page.locator('[data-testid="skill-gap"]')).toHaveCount(5)
  })

  test('should display market trends', async ({ page }) => {
    await page.click('[data-testid="trends-tab"]')
    await expect(page.locator('[data-testid="market-trends"]')).toBeVisible()
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible()
  })

  test('should allow job filtering', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'react developer')
    await page.click('[data-testid="search-button"]')
    await expect(page.locator('[data-testid="job-card"]')).toHaveCount(20)
  })

  test('should display application tracker', async ({ page }) => {
    await page.click('[data-testid="applications-tab"]')
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible()
    await expect(page.locator('[data-testid="application-card"]')).toHaveCount(10)
  })
})

test.describe('Job Application Flow', () => {
  test('should complete easy apply flow', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('[data-testid="job-card"]:first-child')
    await page.click('[data-testid="apply-button"]')
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })

  test('should generate cold email', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('[data-testid="job-card"]:first-child')
    await page.click('[data-testid="email-button"]')
    await expect(page.locator('[data-testid="email-modal"]')).toBeVisible()
    await page.click('[data-testid="generate-email"]')
    await expect(page.locator('[data-testid="email-content"]')).toContainText('Dear')
  })
})