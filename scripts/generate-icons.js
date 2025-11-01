import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'

function drawShip(ctx, size) {
  const center = size / 2
  const body = '#4ecdc4'
  const accent = '#00ffff'

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#0b0f26'
  ctx.fillRect(0, 0, size, size)

  // subtle radial vignette
  const rad = ctx.createRadialGradient(center, center, size * 0.2, center, center, size * 0.9)
  rad.addColorStop(0, 'rgba(255,255,255,0.02)')
  rad.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = rad
  ctx.fillRect(0, 0, size, size)

  ctx.save()
  ctx.translate(center, center + size * 0.08)
  ctx.shadowBlur = size * 0.08
  ctx.shadowColor = body
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.35)
  ctx.lineTo(size * 0.23, size * 0.18)
  ctx.lineTo(-size * 0.23, size * 0.18)
  ctx.closePath()
  ctx.fill()

  // cockpit
  ctx.fillStyle = accent
  ctx.fillRect(-size * 0.08, -size * 0.05, size * 0.16, size * 0.12)

  // engine glow
  const grad = ctx.createLinearGradient(-size * 0.12, size * 0.18, size * 0.12, size * 0.18)
  grad.addColorStop(0, '#ffff80')
  grad.addColorStop(1, accent)
  ctx.fillStyle = grad
  ctx.fillRect(-size * 0.12, size * 0.18, size * 0.24, size * 0.05)

  ctx.restore()
}

function gen(outPath, size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  drawShip(ctx, size)
  const buf = canvas.toBuffer('image/png')
  const tmp = outPath + '.tmp'
  fs.writeFileSync(tmp, buf)
  try {
    fs.renameSync(tmp, outPath)
  } catch (e) {
    // Fallback to copy + unlink if rename across devices fails
    fs.writeFileSync(outPath, buf)
    try {
      fs.unlinkSync(tmp)
    } catch (_) {}
  }
  console.log('Wrote', outPath)
}

const root = path.resolve(process.cwd())
const pub = path.join(root, 'public')
fs.mkdirSync(pub, { recursive: true })
gen(path.join(pub, 'icon-192.png'), 192)
gen(path.join(pub, 'icon-512.png'), 512)
