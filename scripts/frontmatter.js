// The pack's single frontmatter parser.
//
// It replaced two identical copies: validate.js's readFrontmatter and
// version-sync.js's parseFrontmatter. Same regex, same folded/literal handling,
// same quote strip — which meant a parser fix had to be made twice or the two
// gates would silently disagree about what a skill's frontmatter says.
// validate.js gates name/description; version-sync.js hashes those descriptions
// into the published catalog, so drift between them puts a wrong description on
// the public site while every gate stays green.
//
// Scope is deliberately narrow: enough YAML frontmatter to read `name` and
// `description` from a SKILL.md, nothing more. It is not a YAML parser and must
// not grow into one — the frontmatter it reads is machine-written and flat.

/**
 * Parse a SKILL.md-style `--- ... ---` frontmatter block into a flat object.
 *
 * Handles the shapes this pack actually uses: plain `key: value`, quoted
 * values (surrounding quotes stripped), and folded/literal block values
 * (`key: |` or `key: >`) whose indented continuation lines are joined into a
 * single line. CRLF is normalized.
 *
 * Returns `{}` when the document has no frontmatter block or the block is
 * unterminated, so callers can treat "no frontmatter" and "malformed" alike.
 *
 * @param {string} fileContent Full file text.
 * @returns {Record<string, string>} Parsed scalar fields.
 */
export function parseFrontmatter(fileContent) {
  const cleanContent = String(fileContent).replace(/\r\n/g, '\n');
  if (!cleanContent.startsWith('---')) return {};
  const end = cleanContent.indexOf('\n---', 3);
  if (end === -1) return {};
  const lines = cleanContent.slice(3, end).split('\n');
  const res = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].trimEnd().match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim().replace(/^['"]|['"]$/g, '');
    if (!val || /^(\||>)[+-]?$/.test(val)) {
      const buf = [];
      for (let j = i + 1; j < lines.length; j++) {
        const nxt = lines[j];
        if (/^\s{2,}\S/.test(nxt) || /^\t+\S/.test(nxt)) buf.push(nxt.trim());
        else break;
      }
      val = buf.join(' ');
    }
    res[key] = val;
  }
  return res;
}
