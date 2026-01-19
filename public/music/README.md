# Background Music Setup

This folder contains the background music file for VenueVibe.

## Required File

Place your music file as: `background-music.mp3`

## Where to Get Free Relaxing Music

Here are the best sources for **100% free, royalty-free** relaxing background music:

### 1. **Pixabay Music** (Recommended)
- **Website**: https://pixabay.com/music/
- **License**: Free for commercial use, no attribution required
- **How to use**:
  1. Visit https://pixabay.com/music/
  2. Search for "relaxing", "calm", "ambient", or "lofi"
  3. Filter by mood: "Calm", "Dreamy", "Peaceful"
  4. Download MP3 format
  5. Rename to `background-music.mp3`
  6. Place in this folder

**Recommended tracks**:
- "Lofi Study" by FASSounds
- "Calm Ambient Piano" by Lexin_Music
- "Relaxing Music" by SergeQuadrado

### 2. **Free Music Archive**
- **Website**: https://freemusicarchive.org/
- **License**: Various Creative Commons licenses (check each track)
- **Best for**: Curated collections of ambient, chillout, and downtempo

### 3. **Incompetech (by Kevin MacLeod)**
- **Website**: https://incompetech.com/music/royalty-free/music.html
- **License**: Free with attribution (or pay for no attribution)
- **Best for**: Classical ambient, peaceful piano

### 4. **YouTube Audio Library**
- **Website**: https://studio.youtube.com/
- **License**: Free to use, some require attribution
- **Note**: Requires a YouTube account to access

### 5. **Bensound**
- **Website**: https://www.bensound.com/
- **License**: Free with attribution
- **Best for**: Cinematic, acoustic, and relaxing tracks

## Recommended Music Characteristics

For the best user experience, choose music with these qualities:

- **Length**: 2-5 minutes (will loop automatically)
- **Style**: Ambient, lofi, soft piano, acoustic guitar, nature sounds
- **Volume**: Moderate volume levels (the player defaults to 30%)
- **Tempo**: Slow to medium (60-90 BPM)
- **Mood**: Calm, peaceful, non-intrusive
- **No vocals**: Instrumental only to avoid distraction

## File Format

- **Format**: MP3
- **Sample rate**: 44.1kHz or 48kHz
- **Bitrate**: 128-192 kbps (balance between quality and file size)
- **File size**: Keep under 5MB for faster loading

## Testing Your Music

After adding your music file:

1. Restart the development server: `npm run dev`
2. Open the app in your browser
3. Click the music player button in the bottom-right corner
4. Adjust the volume to ensure it's comfortable
5. Let it play for a few minutes to ensure smooth looping

## License Compliance

Always check the license of the music you download:

- ✅ **Public Domain**: Use freely, no attribution needed
- ✅ **CC0 (Creative Commons Zero)**: Use freely, no attribution needed
- ✅ **CC BY**: Free to use with attribution (add to credits)
- ⚠️ **CC BY-NC**: Free for non-commercial use only
- ❌ **Copyright**: Do not use without permission

## Adding Attribution (If Required)

If your chosen track requires attribution, add it to the footer or credits section of the app. Include:

- Track title
- Artist name
- Source website
- License type

Example:
```
Music: "Peaceful Morning" by Artist Name
Source: Pixabay / License: CC0
```

## Deployment to Vercel

**The music file deploys automatically with your app!**

When you deploy to Vercel, the MP3 file in `/public/music/` is:
- ✅ Automatically included in the deployment
- ✅ Served as a static asset from Vercel's global CDN
- ✅ Cached efficiently for fast loading worldwide
- ✅ Completely free (no extra storage costs)

**File Size Considerations:**
- Your current file: **11MB** - Perfect! ✅
- Vercel limit for files in `/public`: **50MB** per file
- Total project size limit: **1GB** uncompressed

**No additional configuration needed!** The file at `/public/music/background-music.mp3` will be accessible at:
```
https://yourdomain.vercel.app/music/background-music.mp3
```

**Note:** You do NOT need Vercel Blob Storage for this. Blob is for user-generated content or files that change frequently. Your static background music file belongs in `/public`.

## Troubleshooting

**Music not playing?**
- Check that the file is named exactly `background-music.mp3`
- Verify the file is in the correct folder: `/public/music/`
- Clear browser cache and reload
- Check browser console for errors

**File too large?**
- Keep under 50MB for Vercel deployment
- Recommended: 5-15MB for good quality without excessive load time
- Use an audio converter to reduce bitrate if needed
- Recommended tools: Audacity (free), Online-Convert.com

**Music cuts off when looping?**
- Ensure the audio file doesn't have silence at the end
- Use Audacity to trim silence from start/end
