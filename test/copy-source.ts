import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

function copySource(folder: string) {
  const rootDirectory = join(process.cwd())
  const destinationDirectory = join(process.cwd(), 'test', folder, 'source')

  if (existsSync(destinationDirectory)) {
    rmSync(destinationDirectory, { recursive: true })
  }

  mkdirSync(destinationDirectory)

  // Copy root files to make sure tsconfig overrides also apply.
  execSync(`find ${rootDirectory} -maxdepth 1 -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec cp {} ${destinationDirectory} \\;`)
}

copySource('epic')
copySource('preact')
