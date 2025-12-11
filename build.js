import * as esbuild from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync, cpSync, renameSync, existsSync, readdirSync, statSync, copyFileSync, createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production'

// Read index.html
const indexHtml = readFileSync(join(__dirname, 'index.html'), 'utf8')

// Extract entry point from index.html
const entryMatch = indexHtml.match(/src="([^"]+)"/)
const entryPoint = entryMatch ? join(__dirname, entryMatch[1]) : join(__dirname, 'src/main.jsx')

console.log('Building with esbuild...')
console.log('Entry point:', entryPoint)

try {
  mkdirSync('dist', { recursive: true })
  mkdirSync('dist/assets', { recursive: true })
  
  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    outdir: 'dist/assets',
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    minify: isProduction,
    sourcemap: false,
    jsx: 'automatic',
    jsxImportSource: 'react',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    loader: {
      '.js': 'jsx',
      '.jsx': 'jsx',
      '.css': 'css',
    },
    external: ['canvas'],
    entryNames: 'index', // Force output name to be index.js/index.css
  })

  // Rename main.js to index.js and main.css to index.css if needed
  const assetsDir = join(__dirname, 'dist/assets')
  if (existsSync(join(assetsDir, 'main.js'))) {
    renameSync(join(assetsDir, 'main.js'), join(assetsDir, 'index.js'))
  }
  if (existsSync(join(assetsDir, 'main.css'))) {
    renameSync(join(assetsDir, 'main.css'), join(assetsDir, 'index.css'))
  }
  
  // Update index.html with correct paths
  let updatedHtml = indexHtml
    .replace(/src="[^"]+"/, `src="/assets/index.js"`)
  
  // Add CSS link if not present
  if (!updatedHtml.includes('index.css')) {
    updatedHtml = updatedHtml.replace('</head>', '    <link rel="stylesheet" href="/assets/index.css" />\n  </head>')
  }
  
  // Remove service worker registration if it exists
  updatedHtml = updatedHtml.replace(/<script[^>]*serviceWorker[^>]*>[\s\S]*?<\/script>/gi, '')
  
  // Add service worker unregistration script before the main script
  const unregisterScript = `    <script>
      // Unregister any old service workers to prevent caching issues
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
    </script>`
  updatedHtml = updatedHtml.replace('<script type="module"', unregisterScript + '\n    <script type="module"')
  
  writeFileSync(join(__dirname, 'dist/index.html'), updatedHtml)
  
  // Copy public assets if they exist (but don't overwrite dist/index.html)
  try {
    const publicDir = join(__dirname, 'public')
    const distDir = join(__dirname, 'dist')
    if (existsSync(publicDir)) {
      // Copy icon.svg to root of dist
      if (existsSync(join(publicDir, 'icon.svg'))) {
        cpSync(join(publicDir, 'icon.svg'), join(distDir, 'icon.svg'), { force: true })
      }
      // Copy music folder (using streams for better reliability)
      if (existsSync(join(publicDir, 'music'))) {
        const musicSrc = join(publicDir, 'music')
        const musicDest = join(distDir, 'music')
        mkdirSync(musicDest, { recursive: true })
        const musicFiles = readdirSync(musicSrc)
        for (const file of musicFiles) {
          const srcPath = join(musicSrc, file)
          const destPath = join(musicDest, file)
          if (statSync(srcPath).isFile()) {
            await pipeline(
              createReadStream(srcPath),
              createWriteStream(destPath)
            )
          }
        }
      }
      // Copy boss-ships folder
      if (existsSync(join(publicDir, 'boss-ships'))) {
        cpSync(join(publicDir, 'boss-ships'), join(distDir, 'boss-ships'), { recursive: true, force: true })
      }
      // Copy sfx folder
      if (existsSync(join(publicDir, 'sfx'))) {
        cpSync(join(publicDir, 'sfx'), join(distDir, 'sfx'), { recursive: true, force: true })
      }
      // Copy other public assets (but skip index.html if it exists)
      const publicFiles = ['manifest.json', 'robots.txt', 'sw.js', 'icon-192.png', 'icon-512.png']
      publicFiles.forEach(file => {
        if (existsSync(join(publicDir, file))) {
          cpSync(join(publicDir, file), join(distDir, file), { force: true })
        }
      })
    }
  } catch (e) {
    console.warn('Warning copying public assets:', e.message)
  }

  console.log('✓ Build complete!')
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}

