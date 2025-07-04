export function loadTranslations(lang: string, translations: Record<string, string>) {
  return (key: string, params: Record<string, string> = {}) => {
    let text = translations[key] || key;
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{{${param}}}`, value);
    }
    return text;
  };
}
