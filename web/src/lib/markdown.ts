import "server-only";
import MarkdownIt from "markdown-it";

// html: false escapes any raw HTML in stored content, so admin-authored markdown can't inject markup.
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

export function renderMarkdown(source: string): string {
  return md.render(source);
}
