#!/usr/bin/env bash
# PostToolUse hook: scan skill files for security issues after Write/Edit
# Uses the security-skill-scanner's scan_skills.py to check for:
#   - External URLs (C2/exfiltration), credential access, persistence mechanisms,
#   - Hidden content (base64, zero-width chars, HTML comments with instructions),
#   - Overly broad tool grants, authority impersonation
#
# Exit behavior:
#   - Outputs JSON with additionalContext on findings (informational, not blocking)
#   - Silent exit 0 if file is not in .claude/skills/ or scan passes

set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.file // empty')

# Normalize to an absolute path (hooks run with cwd = project dir)
[[ "$FILE_PATH" == /* ]] || FILE_PATH="$(pwd)/$FILE_PATH"

# Only scan files under .claude/skills/
[[ "$FILE_PATH" == *"/.claude/skills/"* ]] || exit 0

# Only scan markdown and python files (skill definitions and scripts)
case "$FILE_PATH" in
    *.md|*.py|*.sh|*.js|*.ts) ;;
    *) exit 0 ;;
esac

# Find the skill directory (parent of the file, or grandparent if in references/)
SKILL_DIR="$FILE_PATH"
while [[ "$SKILL_DIR" != *"/.claude/skills/"* ]] || [[ "$(basename "$(dirname "$SKILL_DIR")")" == "skills" ]]; do
    SKILL_DIR="$(dirname "$SKILL_DIR")"
    # Safety: don't go above .claude
    [[ "$SKILL_DIR" == "/" ]] && exit 0
done
# Go up to the skill root (directory containing SKILL.md)
while [[ ! -f "$SKILL_DIR/SKILL.md" ]] && [[ "$SKILL_DIR" == *"/.claude/skills/"* ]]; do
    SKILL_DIR="$(dirname "$SKILL_DIR")"
done

[[ -f "$SKILL_DIR/SKILL.md" ]] || exit 0

# Find the scanner script
SCANNER=""
for candidate in \
    "${CLAUDE_PROJECT_DIR:-/nonexistent}/.claude/skills/security/security-skill-scanner/scripts/scan_skills.py" \
    "$(git -C "$(dirname "$FILE_PATH")" rev-parse --show-toplevel 2>/dev/null)/.claude/skills/security/security-skill-scanner/scripts/scan_skills.py" \
    "$HOME/.claude/skills/security/security-skill-scanner/scripts/scan_skills.py"; do
    if [[ -f "$candidate" ]]; then
        SCANNER="$candidate"
        break
    fi
done

[[ -n "$SCANNER" ]] || exit 0

# Run the scanner on the specific skill directory
set +e
SCAN_OUTPUT=$(python3 "$SCANNER" --paths "$SKILL_DIR" --report-format json --fail-on MEDIUM 2>&1)
EXIT_CODE=$?
set -e

# Exit code 0 = all LOW = clean
if [[ "$EXIT_CODE" -eq 0 ]]; then
    exit 0
fi

# Parse findings for the response
SKILL_NAME=$(basename "$SKILL_DIR")
RISK_SUMMARY=$(echo "$SCAN_OUTPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    findings = []
    skills = data if isinstance(data, list) else data.get('skills', [data] if 'findings' in data else [])
    for skill in skills:
        for f in skill.get('findings', []):
            loc = f' (line {f[\"line_number\"]})' if f.get('line_number') else ''
            findings.append(f'  - [{f.get(\"severity\", \"?\")}] {f.get(\"check\", \"?\")}{loc}: {f.get(\"detail\", \"unknown\")}')
    if findings:
        print('\n'.join(findings[:10]))
    else:
        print('  (could not parse findings)')
except:
    print('  (scanner output was not JSON)')
" 2>/dev/null) || RISK_SUMMARY="  (could not parse scanner output)"

# Return as additionalContext so Claude is informed but not blocked
jq -n \
    --arg ctx "SECURITY SCAN for skill '$SKILL_NAME' found issues (exit code $EXIT_CODE):
$RISK_SUMMARY

Review the findings. If this is a newly added third-party skill, verify the flagged patterns are benign before committing. Run 'python3 $SCANNER --paths $SKILL_DIR' for full details." \
    '{
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": $ctx
        }
    }'
