# tools/smoke_test.py
# Kiem tra ket noi mang va luong co ban: bat server, cho 4 client gia ket noi va trao doi message.
# Phu thuoc: Python 3.10+, websockets, Node.js.

import asyncio
import json
import os
import subprocess
import sys
import time
import urllib.request
import websockets

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PORT = 8088

async def fake_client(client_id):
    uri = f"ws://127.0.0.1:{PORT}"
    async with websockets.connect(uri) as ws:
        # 1. Gui join
        join_msg = {
            "t": "join",
            "name": f"Tester_{client_id}",
            "colors": {"hat": client_id, "shirt": client_id, "hair": client_id}
        }
        await ws.send(json.dumps(join_msg))

        # 2. Cho nhan welcome
        welcome_raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
        welcome = json.loads(welcome_raw)
        if welcome.get('t') != 'welcome':
            raise Exception(f"Client {client_id} ky vong 'welcome', nhan duoc: {welcome}")

        # 3. Gui ping va cho pong
        client_time = int(time.time() * 1000)
        ping_msg = {"t": "ping", "c": client_time}
        await ws.send(json.dumps(ping_msg))

        pong_raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
        pong = json.loads(pong_raw)
        if pong.get('t') != 'pong' or pong.get('c') != client_time:
            raise Exception(f"Client {client_id} nhan pong khong hop le: {pong}")

        # Giu ket noi them 1 giay
        await asyncio.sleep(1.0)
        return True

async def run_smoke():
    print("=== DANG CHAY SMOKE_TEST.PY ===")
    server_js = os.path.join(ROOT_DIR, 'server', 'server.js')
    cmd = [
        'node', server_js,
        '--port', str(PORT),
        '--dev',
        '--seed', '1',
        '--headless-test'
    ]

    print(f"1. Dang khoi dong server tren cong {PORT}...")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    try:
        # Cho server khoi dong (toi da 5 giay)
        server_ready = False
        for _ in range(25):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/", timeout=1.0) as resp:
                    if resp.status == 200:
                        server_ready = True
                        break
            except Exception:
                time.sleep(0.2)

        if not server_ready:
            raise Exception("Server khong khoi dong kip thoi gian cho.")

        print("2. Server da san sang, dang ket noi 4 client gia...")
        tasks = [fake_client(i) for i in range(1, 5)]
        results = await asyncio.gather(*tasks)

        if all(results):
            print(f"3. Ca 4 client gia deu gui nhan message (join/welcome/ping/pong) thanh cong.")
            print("=" * 35)
            print("SMOKE_TEST: PASS")
            return 0
        else:
            print("SMOKE_TEST: FAIL")
            return 1

    except Exception as e:
        print(f"SMOKE_TEST: FAIL - Loi: {e}")
        return 1

    finally:
        print("4. Dang don dep va tat server...")
        proc.terminate()
        try:
            proc.wait(timeout=3.0)
        except subprocess.TimeoutExpired:
            proc.kill()

def main():
    ret = asyncio.run(run_smoke())
    sys.exit(ret)

if __name__ == '__main__':
    main()
