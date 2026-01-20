export async function safeCopy(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      alert("Copied");
    } else {
      throw new Error("Clipboard not allowed");
    }
  } catch (err) {
    // Fallback for mobile / WebView
    window.prompt("Copy this manually:", text);
  }
}