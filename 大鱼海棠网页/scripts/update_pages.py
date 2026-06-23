import pathlib
import re

base = pathlib.Path(__file__).resolve().parent.parent / 'html'
files = sorted([f for f in base.iterdir() if f.name.startswith('page') and f.name.endswith('.html')])

pattern_audio = re.compile(r'<audio\s+id="audioElementId".*?</audio>\s*', re.S)
pattern_script_block = re.compile(r'<script>\s*([\s\S]*?)\s*</script>\s*(</body>)', re.S)

for f in files:
    text = f.read_text(encoding='utf-8')
    original = text
    # Remove audio element
    text, audio_count = pattern_audio.subn('', text)

    # Process bottom <script> block if exists
    def rewrite_script(match):
        script_body = match.group(1)
        end_tag = match.group(2)
        # Remove specific shared code blocks from script body
        # Keep page-specific logic
        script_body_orig = script_body
        script_body = re.sub(r"if\s*\(localStorage\.getItem\('isLoggedIn'\) !== 'true'\)\s*\{[\s\S]*?window\.location\.href\s*=\s*['\"][^'\"]+['\"];[\s\S]*?\}\s*", '', script_body)
        script_body = re.sub(r"function\s+saveCurrentPlayTime\s*\(\)\s*\{[\s\S]*?\}\s*", '', script_body)
        script_body = re.sub(r"function\s+setCurrentPlayTime\s*\(\)\s*\{[\s\S]*?\}\s*", '', script_body)
        script_body = re.sub(r"window\.onload\s*=\s*saveCurrentPlayTime\s*;\s*", '', script_body)
        # Return intact script block if changed
        if script_body.strip() == '':
            return '' + end_tag
        return f'<script>\n{script_body}\n</script>\n{end_tag}'

    text, script_count = pattern_script_block.subn(rewrite_script, text, count=1)

    # Ensure common.js is included before </body>
    if '<script src="../js/common.js"></script>' not in text:
        text = text.replace('</body>', '    <script src="../js/common.js"></script>\n</body>')

    if text != original:
        f.write_text(text, encoding='utf-8')
        print(f.name, 'modified', 'audio_removed' if audio_count else '', 'script_block_modified' if script_count else '', 'common_included' if '<script src="../js/common.js"></script>' in text else '')
    else:
        print(f.name, 'unchanged')
