# Blender Installation and Character Generation Guide

## Step 1: Install Blender

### Option A: Download from Official Website (Recommended)

1. Visit: https://www.blender.org/download/
2. Download Blender 4.0+ for macOS
3. Install by dragging Blender.app to `/Applications/`

### Option B: Install via Homebrew

```bash
brew install --cask blender
```

## Step 2: Verify Blender Installation

```bash
# Check if Blender is installed
/Applications/Blender.app/Contents/MacOS/Blender --version

# Or if using Homebrew
blender --version
```

## Step 3: Run Character Generation

Once Blender is installed, run from your project root:

```bash
cd "/Users/ronellbradley/Library/Mobile Documents/com~apple~CloudDocs/Desktop/kaden-adelynn-space-adventures"

# Method 1: Using full path
/Applications/Blender.app/Contents/MacOS/Blender -b -P blender/generate_pack.py -- --outdir ./export --bake 1024 --variants 3

# Method 2: If blender command is in PATH
blender -b -P blender/generate_pack.py -- --outdir ./export --bake 1024 --variants 3
```

## Step 4: Check Output

After generation completes, check the export folder:

```bash
ls -la export/
ls -la export/kaden/
ls -la export/adelynn/
```

You should see:
- Portrait PNGs (1024x1024) for each character
- GLB and FBX files
- Texture files (if baking succeeded)
- Variant files

## Step 5: Integrate Portraits into iOS App

```bash
cd blender
./integrate_portraits.sh
```

This will copy all portraits to the iOS Assets.xcassets folder.

## Troubleshooting

### "Blender command not found"
- Use the full path: `/Applications/Blender.app/Contents/MacOS/Blender`
- Or add Blender to your PATH

### "Permission denied"
- Make sure export directory is writable
- Check file permissions

### "Cycles not available"
- Blender 4.0+ includes Cycles by default
- If missing, reinstall Blender

### Generation takes too long
- Use `--bake 0` to skip texture baking (faster)
- Use `--engine eevee` for faster rendering
- Reduce variants: `--variants 1`

## Quick Start (Minimal)

For fastest generation without texture baking:

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P blender/generate_pack.py -- --outdir ./export --bake 0 --variants 1
```

This generates all 10 characters with portraits in ~2-3 minutes.

