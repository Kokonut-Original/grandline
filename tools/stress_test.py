# tools/stress_test.py
# Kiem tra tai he thong voi 32 client dong thoi, do luong hieu nang server tickMs qua log perf.
# Phu thuoc: Python 3.10+, websockets, Node.js.

import argparse
import asyncio
import glob
import json
import math
import os
import random
import subprocess
import sys
import time
import urllib.request
import websockets

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LOGS_DIR = os.path.join(ROOT_DIR, 'logs')

async def client_worker(client_id, port, duration, stats):
    uri = f"ws://127.0.0.1:{port}"
    try:
        async with websockets.connect(uri) as ws:
            # 1. Gui join message
            join_msg = {
                "t": "join",
                "name": f"StressBot_{client_id:02d}",
                "colors": {
                    "hat": f"#{random.randint(0, 0xFFFFFF):06x}",
                    "shirt": f"#{random.randint(0, 0xFFFFFF):06x}",
                    "hair": f"#{random.randint(0, 0xFFFFFF):06x}"
                }
            }
            await ws.send(json.dumps(join_msg))

            # Cho message welcome
            welcome_received = False
            while not welcome_received:
                raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
                msg = json.loads(raw)
                if msg.get('t') == 'welcome':
                    welcome_received = True

            stats['connected'] += 1

            # Neu la client 1 (host), gui start
            if client_id == 1:
                await ws.send(json.dumps({"t": "start"}))

            end_time = time.time() + duration
            seq = 0
            angle = random.uniform(0, math.tau)

            async def input_loop():
                nonlocal seq, angle
                while time.time() < end_time:
                    seq += 1
                    angle = (angle + 0.1) % math.tau
                    # Ngau nhien huong di chuyen W/A/S/D
                    # 1: W, 2: A, 4: S, 8: D
                    btn_mask = random.choice([1, 2, 4, 8, 5, 9, 6, 10, 0])
                    input_msg = {
                        "t": "input",
                        "s": seq,
                        "b": btn_mask,
                        "a": round(angle, 2)
                    }
                    try:
                        await ws.send(json.dumps(input_msg))
                    except Exception:
                        break
                    await asyncio.sleep(1.0 / 30.0)

            async def ping_loop():
                while time.time() < end_time:
                    try:
                        c_time = int(time.time() * 1000)
                        await ws.send(json.dumps({"t": "ping", "c": c_time}))
                    except Exception:
                        break
                    await asyncio.sleep(2.0)

            async def recv_loop():
                while time.time() < end_time:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=2.0)
                        msg = json.loads(raw)
                        t = msg.get('t')
                        if t == 'snap':
                            stats['snapshots'] += 1
                        elif t == 'pong':
                            stats['pongs'] += 1
                    except asyncio.TimeoutError:
                        continue
                    except Exception:
                        break

            await asyncio.gather(input_loop(), ping_loop(), recv_loop())
            return True
    except Exception as e:
        stats['errors'].append(f"Client {client_id} loi: {e}")
        return False

def read_perf_logs():
    if not os.path.exists(LOGS_DIR):
        return []

    log_files = sorted(glob.glob(os.path.join(LOGS_DIR, "server-*.log")), reverse=True)
    if not log_files:
        return []

    latest_log = log_files[0]
    perf_entries = []

    try:
        with open(latest_log, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if entry.get('tag') == 'perf':
                        perf_entries.append(entry.get('data', {}))
                except Exception:
                    continue
    except Exception as e:
        print(f"Khong doc duoc file log {latest_log}: {e}")

    return perf_entries

async def run_stress(port, clients_count, duration):
    print("=" * 60)
    print(f"ONE PIECE BATTLEGROUND - STRESS TEST ({clients_count} CLIENTS - {duration}s)")
    print("=" * 60)

    server_js = os.path.join(ROOT_DIR, 'server', 'server.js')
    cmd = [
        'node', server_js,
        '--port', str(port),
        '--dev',
        '--seed', '1',
        '--headless-test'
    ]

    print(f"1. Khoi dong server tai cong {port}...")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    try:
        server_ready = False
        for _ in range(30):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=1.0) as resp:
                    if resp.status == 200:
                        server_ready = True
                        break
            except Exception:
                time.sleep(0.2)

        if not server_ready:
            raise Exception("Server khong khoi dong kip thoi gian cho.")

        print(f"2. Server san sang. Dang ket noi {clients_count} client va chay trong {duration}s...")
        stats = {
            'connected': 0,
            'snapshots': 0,
            'pongs': 0,
            'errors': []
        }

        tasks = [client_worker(i, port, duration, stats) for i in range(1, clients_count + 1)]
        await asyncio.gather(*tasks)

        print("3. Kiem tra thong so thu thap:")
        print(f"   - So client ket noi thanh cong: {stats['connected']} / {clients_count}")
        print(f"   - Tong so snapshot nhan duoc: {stats['snapshots']}")
        print(f"   - Tong so goi pong phan hoi: {stats['pongs']}")

        if stats['errors']:
            print(f"   - So loi ghi nhan: {len(stats['errors'])}")
            for err in stats['errors'][:5]:
                print(f"     + {err}")

        # Cho 1 giay de log duoc ghi het
        await asyncio.sleep(1.0)

        perf_logs = read_perf_logs()
        print(f"4. Kiem tra log perf he thong (tim thay {len(perf_logs)} ban ghi):")

        max_tick_avg = 0.0
        for idx, p in enumerate(perf_logs):
            tick_avg = p.get('tickAvgMs', 0.0)
            tick_max = p.get('tickMaxMs', 0.0)
            ent_cnt = p.get('entityCount', 0)
            cli_cnt = p.get('clientCount', 0)
            print(f"   [Perf #{idx+1}] tickAvg: {tick_avg}ms, tickMax: {tick_max}ms, entities: {ent_cnt}, clients: {cli_cnt}")
            if tick_avg > max_tick_avg:
                max_tick_avg = tick_avg

        passed = True
        if stats['connected'] < clients_count:
            print(f"[FAIL] Khong du {clients_count} client ket noi.")
            passed = False

        if stats['snapshots'] == 0:
            print("[FAIL] Khong nhan duoc bat ky snapshot nao.")
            passed = False

        # Neu duration du dai de co ban ghi perf (>= 10s), kiem tra gioi han 15ms
        if duration >= 10:
            if not perf_logs:
                print("[WARN] Chua ghi nhan duoc ban ghi perf nao tu log file.")
            elif max_tick_avg > 15.0:
                print(f"[FAIL] tickAvgMs vuot nguong 15ms ({max_tick_avg}ms > 15ms).")
                passed = False
            else:
                print(f"[PASS] tickAvgMs ({max_tick_avg}ms) nam trong gioi han cho phep (< 15ms).")

        print("=" * 60)
        if passed:
            print("STRESS_TEST: PASS")
            return 0
        else:
            print("STRESS_TEST: FAIL")
            return 1

    except Exception as e:
        print(f"STRESS_TEST: FAIL - Ngoai le: {e}")
        return 1

    finally:
        print("5. Don dep va dung tien trinh server...")
        proc.terminate()
        try:
            proc.wait(timeout=3.0)
        except subprocess.TimeoutExpired:
            proc.kill()

def main():
    parser = argparse.ArgumentParser(description="Stress test cho server One Piece Battleground")
    parser.add_argument("--port", type=int, default=8089, help="Cong server test")
    parser.add_argument("--clients", type=int, default=32, help="So client gia lap ket noi")
    parser.add_argument("--duration", type=int, default=12, help="Thoi gian chay test (giay)")

    args = parser.parse_args()
    ret = asyncio.run(run_stress(args.port, args.clients, args.duration))
    sys.exit(ret)

if __name__ == '__main__':
    main()
