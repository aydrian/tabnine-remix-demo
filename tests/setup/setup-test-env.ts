import '@testing-library/jest-dom/vitest'
import { installGlobals } from '@remix-run/node'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach } from 'vitest'

installGlobals()

// one time setup here
// fs.copyFileSync(BASE_DATABASE_PATH, DATABASE_PATH)

afterEach(() => {
  cleanup()
})
afterAll(async () => {})
