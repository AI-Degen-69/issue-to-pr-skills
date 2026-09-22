# Security Checklist

- Input validation at the boundary (never inside the handler)
- Auth / RBAC checked before side effect
- Secrets not in diff (scan before push)
- OWASP Top 10: injection, XSS, CSRF, broken auth — checked by `security-reviewer`
