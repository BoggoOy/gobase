# Copyright Boggo Oy. Licensed under the Apache License 2.0.
"""Rename user-facing "Supabase" text to "GoBase" in Supabase Studio.

Usage (from the repository root):
  python3 scripts/gobase/rebrand-studio.py list    # show what would change
  python3 scripts/gobase/rebrand-studio.py apply   # change files and add the modification notice

Only JSX text and string/template literals change. Comments, imports, identifiers, URLs and
references to real Supabase tools and products (CLI, client libraries, docs, Vault, ...) and
Supabase Inc legal, billing and marketplace texts are kept. Run `apply` again after every upstream
merge: on a conflict in a renamed file, take the upstream version and re-run the script.
"""
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'apps', 'studio')
MODE = sys.argv[1] if len(sys.argv) > 1 else 'list'
if MODE not in ('list', 'apply'):
    sys.exit('usage: rebrand-studio.py list|apply')

NOTICE = '// Modified by Boggo Oy for GoBase: user-facing "Supabase" text renamed to "GoBase".\n'

SCAN_DIRS = ['components', 'pages', 'hooks', 'lib', 'state', 'data', 'routes']
SKIP_PATH = re.compile(
    r'(\.test\.|\.spec\.|__mocks__|/lib/ai/|/evals/|/tests/|routeTree\.gen|'
    r'/components/interfaces/Docs/|/components/interfaces/Connect/|'
    r'/components/interfaces/ConnectSheet/|/static-data/|/GoBase/|\.d\.ts$|'
    # Supabase Inc legal, billing and marketplace texts (platform only) stay as they are.
    r'/Organization/Documents/|/Organization/BillingSettings/|/Organization/Usage/|'
    r'/Organization/CloudMarketplace/|/Organization/ProjectClaim/|/IndirectTaxDeclarationModal|'
    r'/BannerTermsOfService|/components/interfaces/Billing/|/Integrations/VercelGithub/|'
    r'/Integrations/Marketplace/MarketplaceDetailRail|/Home/Home\.constants|'
    r'/Functions/Functions\.templates|/pages/api/|/lib/error-reporting|/lib/constants/api\.ts)'
)

# Keep the line unchanged when the string mentions a real Supabase tool/product or a URL.
KEEP = re.compile(
    r'(https?://|supabase\.com|supabase\.io|@supabase|supabase-js|supabase-py|supabase-flutter|'
    r'supabase-swift|supabase-kt|supabase-csharp|Supabase CLI|supabase CLI|Supabase client|'
    r'Supabase Client|Supabase JS|Supabase Python|Supabase Flutter|Supabase Swift|Supabase Kotlin|'
    r'Supabase docs|Supabase Docs|Supabase documentation|Supabase Documentation|Supabase, Inc|'
    r'Supabase Inc|Copyright|Supabase Management API|Management API|Supabase Vault|supabase_vault|'
    r'Supabase Wrappers|Supabase UI|Supabase Status|status\.supabase|Supabase GitHub|'
    r'Supabase MCP|supabase mcp|Supabase Edge Runtime|Supabase Marketplace|NextAuth Supabase|'
    r'Connect with Supabase|Supabase Grafana|Supabase Platform|running Supabase locally|'
    r'Supabase changes only|Supabase files)'
)

# Visible text: JSX text nodes, and string/template literals.
JSX_TEXT = re.compile(r'>([^<>{}]*\bSupabase\b[^<>{}]*)<')
STRING_LIT = re.compile(r"""('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)""")
BARE_JSX_LINE = re.compile(r'^\s*([^<>{}=;()]*\bSupabase\b[^<>{}=;()]*)$')


def is_code_line(line):
    s = line.strip()
    return (
        s.startswith('import ')
        or s.startswith('//')
        or s.startswith('*')
        or s.startswith('/*')
        or s.startswith('{/*')
        or s.startswith('export * from')
    )


def replace_in(text):
    return re.sub(r'\bSupabase\b', 'GoBase', text)


# Whole lines kept as they are (e.g. Supabase as the author of its own integrations).
LINE_KEEP = re.compile(r"^\s*name: 'Supabase',\s*$")


def process_line(line):
    if 'Supabase' not in line or is_code_line(line) or LINE_KEEP.match(line):
        return line
    new = line

    def lit(m):
        s = m.group(0)
        if 'Supabase' not in s or KEEP.search(s):
            return s
        return replace_in(s)

    def jsx(m):
        s = m.group(0)
        if KEEP.search(s):
            return s
        return replace_in(s)

    new = STRING_LIT.sub(lit, new)
    new = JSX_TEXT.sub(jsx, new)
    # A JSX text line on its own (wrapped text inside an element).
    if new == line and BARE_JSX_LINE.match(line) and not KEEP.search(line):
        if not re.search(r'\bSupabase[A-Z_]', line):
            new = replace_in(line)
    return new


changes = []
for d in SCAN_DIRS:
    for dirpath, _, files in os.walk(os.path.join(ROOT, d)):
        for f in files:
            if not f.endswith(('.ts', '.tsx')):
                continue
            path = os.path.join(dirpath, f)
            if SKIP_PATH.search(path):
                continue
            with open(path, encoding='utf-8') as fh:
                lines = fh.readlines()
            out = []
            changed = False
            for i, line in enumerate(lines):
                new = process_line(line)
                if new != line:
                    changed = True
                    changes.append((os.path.relpath(path, ROOT), i + 1, line.rstrip(), new.rstrip()))
                out.append(new)
            if changed and MODE == 'apply':
                if out and not out[-1].endswith('\n'):
                    out[-1] += '\n'
                if NOTICE not in out:
                    out.append(NOTICE)
                with open(path, 'w', encoding='utf-8') as fh:
                    fh.writelines(out)

for path, n, old, new in changes:
    print(f'{path}:{n}\n  - {old.strip()[:160]}\n  + {new.strip()[:160]}')
print(f'\n{len(changes)} lines in {len({c[0] for c in changes})} files', file=sys.stderr)
