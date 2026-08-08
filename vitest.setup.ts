import { afterEach, vi } from 'vitest'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => ({
    src,
    alt,
    ...props,
  }),
}))