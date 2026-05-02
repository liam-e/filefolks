import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as ReadonlyArray<string>).includes(locale)) {
    locale = routing.defaultLocale;
  }

  // ← All your namespaces (add new ones here when you create a tool)
  const namespaces = [
    "Header",
    "Footer",
    "Home",
    "ToolPageLayout",
    "Categories",
    "Privacy",
    "About",
    "PdfMerger",
    "PdfCompressor",
    "JsonFormatter",
    "ImageCompressor",
    "ImageConverter",
    "PdfSplitter",
    "Base64",
    "ImageToPdf",
    "PdfRotator",
    "ImageResizer",
    "ImageCrop",
    "UrlEncoder",
    "JwtDecoder",
    "UuidGenerator",
    "HashGenerator",
    "VideoToGif",
    "ExtractFrames",
    "VideoThumbnail",
    "VideoMetadata",
    "ZipFiles",
    "UnzipFiles",
    "WordCounter",
    "CaseConverter",
    "LoremIpsum",
    "DuplicateLineRemover",
    "LineSorter"
  ] as const;

  const messages = await Promise.all(
      namespaces.map(async (ns) => {
        try {
          const mod = await import(`../../messages/${locale}/${ns}.json`);
          return { [ns]: mod.default };
        } catch (e) {
          console.warn(`⚠️ Missing namespace: ${locale}/${ns}.json`);
          return { [ns]: {} };
        }
      })
  );

  return {
    locale,
    messages: Object.assign({}, ...messages),
  };
});