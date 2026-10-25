# tools/run_all.py
# Tong hop bo kiem tra Double Check: check_static -> check_data -> unit tests -> smoke_test.
# Phu thuoc: Python 3.10+, Node.js.

import os
import subprocess
import sys
import time

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

STEPS = [
    ("1. Kiem tra tinh & cu phap (check_static.py)", [sys.executable, os.path.join(ROOT_DIR, 'tools', 'check_static.py')]),
    ("2. Kiem tra du lieu shared (check_data.js)", ['node', os.path.join(ROOT_DIR, 'tools', 'check_data.js')]),
    ("3. Chay unit test server (server/tests/run.js)", ['node', os.path.join(ROOT_DIR, 'server', 'tests', 'run.js')]),
    ("4. Chay smoke test mang (smoke_test.py)", [sys.executable, os.path.join(ROOT_DIR, 'tools', 'smoke_test.py')])
]

def main():
    start_time = time.time()
    print("=" * 60)
    print("ONE PIECE BATTLEGROUND – DOUBLE CHECK RUNNER (RUN_ALL)")
    print("=" * 60)

    results = []
    overall_pass = True

    for name, cmd in STEPS:
        print(f"\n>>> BUOC: {name}")
        proc = subprocess.run(cmd, cwd=ROOT_DIR)
        if proc.returncode == 0:
            print(f"--> KET QUA: PASS")
            results.append((name, "PASS"))
        else:
            print(f"--> KET QUA: FAIL (ma loi: {proc.returncode})")
            results.append((name, "FAIL"))
            overall_pass = False

    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print("TONG HOP KET QUA DOUBLE CHECK:")
    for name, res in results:
        status_symbol = "[OK]" if res == "PASS" else "[XX]"
        print(f"  {status_symbol} {name}: {res}")

    print(f"Thoi gian thuc thi: {elapsed:.2f}s")
    if overall_pass:
        print("KET LUAN: ALL PASS")
        print("=" * 60)
        sys.exit(0)
    else:
        print("KET LUAN: CO BUOC FAIL")
        print("=" * 60)
        sys.exit(1)

if __name__ == '__main__':
    main()
