# tools/check_static.py
# Kiem tra tinh: luat code, file ton tai, thu tu script trong index.html, node --check.
# Phu thuoc: Python 3.10+, Node.js.

import os
import re
import subprocess
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

EXPECTED_SCRIPTS = [
    '/shared/00-namespace.js',
    '/shared/01-constants.js',
    '/shared/02-enums.js',
    '/shared/03-protocol.js',
    '/shared/04-keybinds.js',
    '/shared/05-rng.js',
    '/shared/10-data-fruits.js',
    '/shared/11-data-weapons.js',
    '/shared/12-data-items.js',
    '/shared/13-data-bosses.js',
    '/shared/14-data-islands.js',
    '/shared/15-data-boats.js',
    '/shared/16-data-zone.js',
    '/shared/20-rules-damage.js',
    '/shared/21-mapgen.js',
    '/client/js/00-boot.js',
    '/client/js/01-net.js',
    '/client/js/02a-pixel-core.js',
    '/client/js/02b-palette.js',
    '/client/js/02c-sprites-chars.js',
    '/client/js/02d-sprites-items.js',
    '/client/js/02e-sprites-world.js',
    '/client/js/02f-sprites-fx.js',
    '/client/js/03-input.js',
    '/client/js/04-camera.js',
    '/client/js/05a-render-map.js',
    '/client/js/05b-render-entities.js',
    '/client/js/05c-render-fx.js',
    '/client/js/06-render-hud.js',
    '/client/js/07a-ui-lobby.js',
    '/client/js/07b-ui-inventory.js',
    '/client/js/07c-ui-dialogs.js',
    '/client/js/07d-ui-chat.js',
    '/client/js/07e-ui-spectate.js',
    '/client/js/07f-ui-endscreen.js',
    '/client/js/08-audio.js',
    '/client/js/09-predict.js',
    '/client/js/10-main.js'
]

FORBIDDEN_PATTERNS = [
    (r'\bimport\s+[\w*{]', 'Tu khoa import khong duoc phep'),
    (r'\bexport\s+(default|const|let|var|function|class|\{)', 'Tu khoa export khong duoc phep'),
    (r'\bfetch\s*\(', 'Khong duoc dung fetch() phia client/shared'),
    (r'https?://(?:cdn|unpkg|cdnjs|jsdelivr)', 'Khong duoc dung CDN ngoai')
]

def check_forbidden_tokens():
    errors = []
    scan_dirs = ['client', 'shared']
    for s_dir in scan_dirs:
        dir_path = os.path.join(ROOT_DIR, s_dir)
        if not os.path.exists(dir_path):
            continue
        for root, _, files in os.walk(dir_path):
            for file in files:
                if not file.endswith('.js'):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, ROOT_DIR)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Bo qua comment de kiem tra chinh xac hon
                # Loai bo block comment /* ... */ va line comment // ...
                cleaned = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
                lines = cleaned.split('\n')
                for idx, line in enumerate(lines, 1):
                    code_part = line.split('//')[0]
                    for pattern, msg in FORBIDDEN_PATTERNS:
                        if re.search(pattern, code_part):
                            errors.append(f"[{rel_path}:{idx}] {msg}: '{code_part.strip()}'")

                    if s_dir == 'client' and re.search(r'\brequire\s*\(', code_part):
                        errors.append(f"[{rel_path}:{idx}] Khong duoc dung require() trong client: '{code_part.strip()}'")

    return errors

def check_script_order():
    errors = []
    index_path = os.path.join(ROOT_DIR, 'client', 'index.html')
    if not os.path.exists(index_path):
        return ["Khong tim thay file client/index.html"]

    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    found_scripts = re.findall(r'<script\s+src=["\']([^"\']+)["\']', html)
    if found_scripts != EXPECTED_SCRIPTS:
        errors.append("Thu tu script trong client/index.html khong dung quy dinh:")
        errors.append(f"  So luong script tim thay: {len(found_scripts)} / {len(EXPECTED_SCRIPTS)}")
        for i in range(max(len(found_scripts), len(EXPECTED_SCRIPTS))):
            act = found_scripts[i] if i < len(found_scripts) else '<thieu>'
            exp = EXPECTED_SCRIPTS[i] if i < len(EXPECTED_SCRIPTS) else '<thua>'
            if act != exp:
                errors.append(f"  Vi tri {i+1}: tim thay '{act}', ky vong '{exp}'")
    return errors

def check_file_conventions():
    errors = []
    scan_dirs = ['server', 'shared', 'client/js']
    for s_dir in scan_dirs:
        dir_path = os.path.join(ROOT_DIR, *s_dir.split('/'))
        if not os.path.exists(dir_path):
            continue
        for root, _, files in os.walk(dir_path):
            for file in files:
                if not file.endswith('.js'):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, ROOT_DIR)
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()

                if len(lines) > 500:
                    errors.append(f"[{rel_path}] File dai qua 500 dong ({len(lines)} dong).")

                # Kiem tra comment tieng Viet o dau file
                has_header_comment = False
                for line in lines[:5]:
                    s = line.strip()
                    if s.startswith('//') or s.startswith('/*'):
                        has_header_comment = True
                        break
                if not has_header_comment:
                    errors.append(f"[{rel_path}] Thieu comment tieng Viet mo dau file mo ta chuc nang va phu thuoc.")

    return errors

def check_node_syntax():
    errors = []
    scan_dirs = ['server', 'shared', 'client/js', 'tools']
    for s_dir in scan_dirs:
        dir_path = os.path.join(ROOT_DIR, *s_dir.split('/'))
        if not os.path.exists(dir_path):
            continue
        for root, _, files in os.walk(dir_path):
            for file in files:
                if not file.endswith('.js'):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, ROOT_DIR)
                res = subprocess.run(['node', '--check', file_path], capture_output=True, text=True)
                if res.returncode != 0:
                    errors.append(f"[{rel_path}] node --check bao loi:\n{res.stderr.strip()}")

    return errors

def main():
    print("=== DANG CHAY CHECK_STATIC.PY ===")
    all_errors = []

    print("1. Kiem tra tu khoa cam (import, export, fetch, cdn, require)...")
    forbidden_errs = check_forbidden_tokens()
    if forbidden_errs:
        all_errors.extend(forbidden_errs)
        for e in forbidden_errs:
            print(f"  FAIL: {e}")
    else:
        print("  PASS: 0 tu khoa cam.")

    print("2. Kiem tra thu tu the script trong client/index.html...")
    order_errs = check_script_order()
    if order_errs:
        all_errors.extend(order_errs)
        for e in order_errs:
            print(f"  FAIL: {e}")
    else:
        print(f"  PASS: {len(EXPECTED_SCRIPTS)} script dung thu tu.")

    print("3. Kiem tra quy uoc file (so dong < 500, comment dau file)...")
    conv_errs = check_file_conventions()
    if conv_errs:
        all_errors.extend(conv_errs)
        for e in conv_errs:
            print(f"  FAIL: {e}")
    else:
        print("  PASS: Quy uoc file dat chuan.")

    print("4. Chay node --check cho toan bo file JS...")
    syntax_errs = check_node_syntax()
    if syntax_errs:
        all_errors.extend(syntax_errs)
        for e in syntax_errs:
            print(f"  FAIL: {e}")
    else:
        print("  PASS: Toan bo file JS cu phap hop le.")

    print("=" * 35)
    if all_errors:
        print(f"CHECK_STATIC: FAIL ({len(all_errors)} loi)")
        sys.exit(1)
    else:
        print("CHECK_STATIC: PASS")
        sys.exit(0)

if __name__ == '__main__':
    main()
