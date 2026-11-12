# AI Photo Studio Pro

বাংলা-ভিত্তিক responsive photography studio photo editor.

## এই সংস্করণে এখনই কাজ করবে
- JPG / PNG / WEBP ছবি আপলোড (সর্বোচ্চ ২০ MB)
- লাইভ প্রিভিউ
- Brightness, contrast, saturation, warmth, fade সমন্বয়
- Natural, Studio, Vivid, Warm, Mono, Soft preset
- ঘোরানো ও flip
- Passport/NID 35×45 mm, 2×2 inch, 4×6 inch, original ও custom size
- 150/200/300 DPI output pixel calculation
- JPG / PNG / WEBP download
- Print preview
- Local browser processing; uploaded source image is not sent to a server

## চালানোর নিয়ম
1. ZIP ফাইল Extract করুন।
2. `index.html` ফাইল Chrome / Edge-এ খুলুন।
3. ছবি আপলোড করে সাইজ ও কালার ঠিক করুন।
4. ফরম্যাট নির্বাচন করে Download চাপুন।

Google Fonts লোডের জন্য ইন্টারনেট লাগতে পারে; ইন্টারনেট না থাকলেও editor কাজ করবে।

## গুরুত্বপূর্ণ সীমাবদ্ধতা
এটি প্রথম সংস্করণের কার্যকর browser-based editor। AI face retouch, true background removal, hair/clothing replacement এবং old-photo generative restoration এখনো সক্রিয় নয়। এগুলোর জন্য নির্দিষ্ট AI image-editing API, backend এবং API credentials দরকার। UI-তে এগুলোকে তাই “API লাগবে” হিসেবে দেখানো হয়েছে। কোনো ভুয়া AI processing দেখানো হয় না।

## AI backend যুক্ত করার নিরাপদ পরিকল্পনা
- `backend/` ফোল্ডারে Node.js server scaffold আছে।
- API key কেবল server environment variable-এ রাখবেন; `script.js` বা `index.html`-এ কখনো নয়।
- Provider-specific adapter লিখে image upload, provider request, result validation এবং output delivery করতে হবে।
- Provider-এর বর্তমান API docs, supported image-edit endpoint, file limits, pricing এবং commercial-use terms যাচাই করে integration সম্পন্ন করুন।

## Local backend scaffold
Node.js 20+ প্রয়োজন:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
এটি health endpoint এবং AI endpoint-এর নিরাপদ placeholder চালু করবে। Provider key ও adapter configure না করা পর্যন্ত AI request স্পষ্টভাবে unavailable response দেবে।

## ফাইল
- `index.html` — পেজ কাঠামো
- `style.css` — responsive premium UI
- `script.js` — canvas editing, sizing, export
- `backend/server.js` — backend starter
- `backend/ai-provider.js` — provider adapter interface
