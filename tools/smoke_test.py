# tools/smoke_test.py
# Kiem tra ket noi mang va luong co ban: bat server, cho 8 client gia ket noi, test reconnect va nhan snapshot.
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

async def fake_client(client_id, do_reconnect=False):
    uri = f"ws://127.0.0.1:{PORT}"
    async with websockets.connect(uri) as ws:
        # 1. Gui join
        join_msg = {
            "t": "join",
            "name": f"Tester_{client_id}",
            "colors": {"hat": "#d9534f", "shirt": "#337ab7", "hair": "#292b2c"}
        }
        await ws.send(json.dumps(join_msg))

        received_welcome = False
        reconnect_key = None

        while not received_welcome:
            raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
            msg = json.loads(raw)
            if msg.get('t') == 'welcome':
                received_welcome = True
                reconnect_key = msg.get('reconnectKey')

        # 2. Gui ping va cho pong
        client_time = int(time.time() * 1000)
        await ws.send(json.dumps({"t": "ping", "c": client_time}))

        received_pong = False
        received_snap = False

        while not received_pong or not received_snap:
            raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
            msg = json.loads(raw)
            if msg.get('t') == 'pong' and msg.get('c') == client_time:
                received_pong = True
            elif msg.get('t') == 'snap':
                received_snap = True

        if not do_reconnect:
            await asyncio.sleep(0.5)
            return True

    # 3. Kich ban test rot mang va reconnect
    await asyncio.sleep(0.5)
    async with websockets.connect(uri) as ws2:
        reconnect_join = {
            "t": "join",
            "reconnectKey": reconnect_key,
            "name": f"Tester_{client_id}"
        }
        await ws2.send(json.dumps(reconnect_join))

        reconnected = False
        while not reconnected:
            raw = await asyncio.wait_for(ws2.recv(), timeout=5.0)
            msg = json.loads(raw)
            if msg.get('t') == 'welcome' and msg.get('reconnectKey') == reconnect_key:
                reconnected = True

        await asyncio.sleep(0.5)
        return True

async def run_smoke():
    print("=== DANG CHAY SMOKE_TEST.PY (8 CLIENTS) ===")
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

        print("2. Server da san sang, dang ket noi 8 client gia...")
        tasks = []
        for i in range(1, 9):
            # Client 1 se thu nghiem kich ban rot mang va ket noi lai
            is_reconnect_tester = (i == 1)
            tasks.append(fake_client(i, is_reconnect_tester))

        results = await asyncio.gather(*tasks)

        if all(results):
            print("3. Ca 8 client deu ket noi, nhan snapshot va test reconnect thanh cong.")
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
