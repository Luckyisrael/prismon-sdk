export function getFileNameFromContentDisposition(contentDisposition: string): string | undefined {
    if (!contentDisposition) return undefined;
    
    // Try filename* (RFC 5987)
    const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
    if (match && match[1]) return decodeURIComponent(match[1].trim());
  
    // Try regular filename
    const simpleMatch = contentDisposition.match(/filename=['"]?([^'"]*)['"]?/i);
    return simpleMatch?.[1]?.trim();
  }