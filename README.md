# Live Translator 🌐

A **continuous real-time** voice translation website for bidirectional English-Chinese translation, powered by DeepSeek AI and built with Next.js.

## Features

- 🎤 **Continuous Voice Input**: Speak continuously and see text appear in real-time
- 🎙️ **Microphone Selection**: Choose which microphone to use (built-in, external USB, headset, etc.)
- ⚡ **Real-time Translation**: Auto-translates as you speak (no button needed!)
- 🔊 **Voice Output**: Listen to translations with text-to-speech
- 🔄 **Bidirectional Translation**: English ↔ Chinese
- 🎯 **Live Display**: See both original and translated text simultaneously
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **No Authentication Required**: Publicly accessible

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Translation API**: DeepSeek API (OpenAI-compatible)
- **Voice Features**: Web Speech API (browser-native)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm/yarn
- DeepSeek API key ([Get one here](https://platform.deepseek.com/))

## Installation

### 1. Resolve Proxy Issue (If Needed)

If you encounter npm registry errors due to proxy settings, temporarily disable the proxy:

```bash
# Temporarily unset proxy
unset HTTP_PROXY
unset HTTPS_PROXY
unset NO_PROXY

# Or set npm to bypass proxy
npm set registry https://registry.npmjs.org/
```

### 2. Install Dependencies

```bash
cd translator
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your DeepSeek API key:

```env
DEEPSEEK_API_KEY=your_actual_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

**To get a DeepSeek API key:**
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in `.env.local`

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Select Languages**: Choose source and target languages (English or Chinese)
2. **Choose Microphone**: Click the ⚙️ Settings button to select your microphone (optional)
3. **Click the Microphone**: Start continuous listening
4. **Speak Naturally**: Talk continuously - text appears in real-time
5. **Watch Translation**: Translated text appears automatically as you speak
6. **Click Speaker Button**: Listen to the translation
7. **Click Microphone Again**: Stop listening and clear text

**No translate button needed** - it works automatically as you speak!

### Microphone Selection

- Click the ⚙️ (Settings) icon in the top right
- See all available microphones on your system
- Select your preferred microphone (built-in, external USB, headset, etc.)
- Click the 🔄 refresh button if you plug in a new microphone
- The currently selected microphone is shown below the main mic button

## Project Structure

```
translator/
├── app/
│   ├── api/
│   │   └── translate/
│   │       └── route.ts          # Translation API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main translation interface
├── components/
│   ├── LanguageSelector.tsx      # Language dropdown
│   ├── SwapButton.tsx            # Swap languages button
│   ├── TranslationBox.tsx        # Translation input/output box
│   └── VoiceControls.tsx         # Voice input/output controls
├── hooks/
│   ├── useSpeechRecognition.ts   # Speech recognition hook
│   └── useSpeechSynthesis.ts     # Text-to-speech hook
├── lib/
│   └── deepseek.ts               # DeepSeek API client
├── public/                       # Static assets
├── .env.local                    # Environment variables (not in git)
├── .env.local.example            # Environment variables template
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## API Integration

### DeepSeek API

The application uses DeepSeek's API, which is OpenAI-compatible. This allows us to use the OpenAI SDK with DeepSeek's models and pricing.

**Why DeepSeek?**
- OpenAI-compatible (drop-in replacement)
- Significantly more cost-effective than OpenAI
- Good multilingual capabilities including Chinese
- Simple API key authentication

**Model Used**: `deepseek-chat` (optimized for translation tasks)

## How It Works

1. **Continuous Speech Recognition**: Uses Web Speech API with `continuous=true` to keep listening
2. **Real-time Text Display**: Shows both interim (in-progress) and final transcriptions
3. **Auto-Translation**: Debounced API calls translate text 500ms after you pause speaking
4. **Auto-Restart**: Automatically restarts listening if it stops (for truly continuous experience)
5. **Smart Debouncing**: Avoids API spam by waiting for natural pauses in speech

## Browser Compatibility

Voice features use the Web Speech API, which is supported in:
- ✅ Chrome/Edge (best experience - full continuous support)
- ✅ Safari (partial support)
- ❌ Firefox (limited support)

**Recommended**: Use Chrome or Edge for the best continuous experience.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variable: `DEEPSEEK_API_KEY`
4. Deploy!

Vercel will automatically detect Next.js and configure everything.

### Other Platforms

Ensure you:
1. Build the project: `npm run build`
2. Set the `DEEPSEEK_API_KEY` environment variable
3. Run the production server: `npm start`

## Troubleshooting

### npm install fails with 403 errors

This is likely due to proxy settings. Try:
```bash
# Temporary solution
unset HTTP_PROXY HTTPS_PROXY
npm install
```

### Voice features not working

- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Check that you've granted microphone permissions
- Verify your browser supports Web Speech API

### Translation errors

- Verify your DeepSeek API key is correct in `.env.local`
- Check that you have API credits in your DeepSeek account
- Ensure the API endpoint is accessible

## Security Notes

- **Never commit `.env.local` to version control** (it's in `.gitignore`)
- API keys are stored server-side and never exposed to the client
- The `/api/translate` route handles all API calls securely

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Translation powered by [DeepSeek AI](https://www.deepseek.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
