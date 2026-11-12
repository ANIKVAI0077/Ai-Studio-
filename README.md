# AI Photo Studio Pro — Batch Passport Edition

## কীভাবে চালাবেন
1. ZIP Extract করুন।
2. `index.html` Chrome / Edge-এ খুলুন।
3. একসঙ্গে সর্বোচ্চ ২০টি JPG, PNG বা WEBP ছবি আপলোড করুন।
4. নিচের ছবির তালিকা থেকে একটি ছবি বেছে Zoom, Position, Rotate ও Color ঠিক করুন।
5. সাইজ, DPI, ব্যাকগ্রাউন্ড ও ফরম্যাট নির্বাচন করুন।
6. **পাসপোর্ট সাইজ তৈরি করুন** চাপুন।
7. প্রতিটি ফলাফল আলাদাভাবে অথবা ZIP-এ ডাউনলোড করুন।

## ফিচার
- সর্বোচ্চ ২০টি ছবি এক ব্যাচে
- প্রতিটি ছবির আলাদা প্রিভিউ ও crop framing controls
- Passport / NID 35×45 mm, 2×2 inch, custom, original ratio
- 150 / 200 / 300 DPI অনুযায়ী pixel dimensions
- Background: white, blue, red, light gray, original/transparent
- Brightness, contrast, saturation, warmth
- JPG, PNG, WEBP export
- 4×6 inch print sheet, প্রতি ছবির 1/2/4/6/8/12/20 copies
- ZIP export for all generated photos
- Developer credit and WhatsApp link

## Developer photo
`assets/developer-photo.jpg` নামে আপনার নিজের ছবি রাখলে footer-এ দেখাবে। ছবিটি না থাকলে AM initials avatar দেখাবে।

## গুরুত্বপূর্ণ সীমাবদ্ধতা
এই ভার্সনে crop, sizing, color correction ও export ব্রাউজারেই বাস্তবে হয়; এটি AI face retouch, background segmentation বা generative face repair নয়। সাধারণ ছবির ব্যাকগ্রাউন্ড পরিবর্তন করতে হলে AI/background-removal service API যুক্ত করতে হবে। কোনো AI কাজ হয়েছে বলে ভুয়া ফলাফল দেখানো হয় না।

300 DPI-র জন্য 35×45 mm আউটপুট 413×531 px তৈরি হয়। ব্রাউজার-জেনারেটেড ফাইলে DPI metadata সব প্রিন্টার সফটওয়্যারে একইভাবে সংরক্ষিত নাও থাকতে পারে; print dialog-এ actual size/100% নির্বাচন করুন।
