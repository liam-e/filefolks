const fs = require('fs');
const path = require('path');

const locales = ["en", "es", "fr", "de", "pt-BR", "zh-CN", "ja", "ko", "ru", "ar", "it", "nl"];
const messagesDir = path.join(process.cwd(), "messages");

for (const locale of locales) {
  const oldFile = path.join(messagesDir, `${locale}.json`);
  if (!fs.existsSync(oldFile)) {
    console.log(`⚠️ Skipping ${locale} (not found)`);
    continue;
  }

  console.log(`🔄 Splitting ${locale}...`);
  const content = JSON.parse(fs.readFileSync(oldFile, "utf-8"));
  const localeDir = path.join(messagesDir, locale);
  fs.mkdirSync(localeDir, { recursive: true });

  // Create one .json file per original top-level key
  for (const [key, value] of Object.entries(content)) {
    if (value && typeof value === "object") {
      fs.writeFileSync(
        path.join(localeDir, `${key}.json`),
        JSON.stringify(value, null, 2)
      );
    }
  }

  console.log(`✅ ${locale} done → ${localeDir}`);
}

console.log("\n🎉 All languages split correctly (one file per namespace)!");
