#!/usr/bin/env python3
"""
ระบบประเมินประสิทธิภาพฐานข้อมูลออนโทโลยีวิสาหกิจชุมชน จ.สกลนคร
วัด Precision, Recall, F1-Score และ Response Time
"""

import json
import time
import argparse
import csv
import os
import statistics
from urllib.parse import quote
import requests
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np


# === Metrics Functions ===

def calculate_precision(retrieved, relevant):
    """Precision = |relevant ∩ retrieved| / |retrieved|"""
    if not retrieved:
        return 0.0
    retrieved_set = set(retrieved)
    relevant_set = set(relevant)
    intersection = retrieved_set & relevant_set
    return len(intersection) / len(retrieved_set)


def calculate_recall(retrieved, relevant):
    """Recall = |relevant ∩ retrieved| / |relevant|"""
    if not relevant:
        return 0.0
    retrieved_set = set(retrieved)
    relevant_set = set(relevant)
    intersection = retrieved_set & relevant_set
    return len(intersection) / len(relevant_set)


def calculate_f1(precision, recall):
    """F1 = 2 * (precision * recall) / (precision + recall)"""
    if precision + recall == 0:
        return 0.0
    return 2 * (precision * recall) / (precision + recall)


# === API Call Functions ===

def call_api(api_url, endpoint, timeout=15):
    """เรียก API endpoint และวัดเวลา response"""
    # ตัด /api prefix ออกจาก endpoint เพราะ api_url มี /api อยู่แล้ว
    ep = endpoint
    if ep.startswith('/api'):
        ep = ep[4:]

    # URL encode Thai characters
    parts = ep.split('?', 1)
    if len(parts) == 2:
        path = parts[0]
        params = parts[1]
        param_pairs = params.split('&')
        encoded_pairs = []
        for pair in param_pairs:
            key, value = pair.split('=', 1)
            encoded_pairs.append(f"{key}={quote(value)}")
        full_url = f"{api_url}{path}?{'&'.join(encoded_pairs)}"
    else:
        full_url = f"{api_url}{ep}"

    start_time = time.time()
    try:
        response = requests.get(full_url, timeout=timeout)
        elapsed_ms = (time.time() - start_time) * 1000
        if response.status_code == 200:
            return response.json(), elapsed_ms
        else:
            return None, elapsed_ms
    except Exception as e:
        elapsed_ms = (time.time() - start_time) * 1000
        print(f"  [ERROR] {full_url}: {e}")
        return None, elapsed_ms


def extract_product_ids(data):
    """ดึงรายการ product IDs จาก API response"""
    products = data.get('products', data.get('results', []))
    ids = []
    for p in products:
        # ลำดับการหา ID: product > productName > name
        pid = p.get('product', '') or p.get('productName', '') or p.get('name', '')
        if pid:
            ids.append(pid)
    return ids


# === Evaluation Runner ===

def run_evaluation(api_url, queries, num_rounds=5):
    """ประเมินทุก query"""
    results = []

    for q in queries:
        print(f"\n[Query {q['id']}] {q['query_thai']}")
        print(f"  Endpoint: {q['api_endpoint']}")

        # วัด Response Time หลายรอบ
        response_times = []
        retrieved_ids = []

        for round_num in range(num_rounds):
            data, elapsed = call_api(api_url, q['api_endpoint'])
            response_times.append(elapsed)

            if round_num == 0 and data:
                retrieved_ids = extract_product_ids(data)
                print(f"  Retrieved: {len(retrieved_ids)} items")

        # คำนวณ Precision, Recall, F1
        expected_ids = q['expected_product_ids']
        precision = calculate_precision(retrieved_ids, expected_ids)
        recall = calculate_recall(retrieved_ids, expected_ids)
        f1 = calculate_f1(precision, recall)

        # Response Time Stats
        rt_avg = statistics.mean(response_times)
        rt_min = min(response_times)
        rt_max = max(response_times)
        rt_median = statistics.median(response_times)

        result = {
            'id': q['id'],
            'type': q['type'],
            'query_thai': q['query_thai'],
            'expected_count': q['expected_results'],
            'retrieved_count': len(retrieved_ids),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'response_time_avg_ms': round(rt_avg, 2),
            'response_time_min_ms': round(rt_min, 2),
            'response_time_max_ms': round(rt_max, 2),
            'response_time_median_ms': round(rt_median, 2),
            'response_times': [round(rt, 2) for rt in response_times],
            'expected_ids': expected_ids,
            'retrieved_ids': retrieved_ids,
        }

        print(f"  Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f}")
        print(f"  Response Time: avg={rt_avg:.1f}ms, min={rt_min:.1f}ms, max={rt_max:.1f}ms")

        results.append(result)

    return results


# === Report Generation ===

def generate_summary(results):
    """สร้างสรุปผลรวม"""
    basic = [r for r in results if r['type'] == 'basic']
    semantic = [r for r in results if r['type'] == 'semantic']

    def avg(items, key):
        vals = [i[key] for i in items]
        return round(statistics.mean(vals), 4) if vals else 0

    summary = {
        'overall': {
            'total_queries': len(results),
            'avg_precision': avg(results, 'precision'),
            'avg_recall': avg(results, 'recall'),
            'avg_f1': avg(results, 'f1_score'),
            'avg_response_time_ms': round(avg(results, 'response_time_avg_ms'), 2),
        },
        'basic_search': {
            'total_queries': len(basic),
            'avg_precision': avg(basic, 'precision'),
            'avg_recall': avg(basic, 'recall'),
            'avg_f1': avg(basic, 'f1_score'),
            'avg_response_time_ms': round(avg(basic, 'response_time_avg_ms'), 2),
        },
        'semantic_search': {
            'total_queries': len(semantic),
            'avg_precision': avg(semantic, 'precision'),
            'avg_recall': avg(semantic, 'recall'),
            'avg_f1': avg(semantic, 'f1_score'),
            'avg_response_time_ms': round(avg(semantic, 'response_time_avg_ms'), 2),
        },
    }
    return summary


def export_csv(results, summary, output_dir):
    """ส่งออกผลลัพธ์เป็น CSV"""
    csv_path = os.path.join(output_dir, 'evaluation_results.csv')
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow([
            'ID', 'ประเภท', 'คำถาม', 'คาดหวัง', 'พบจริง',
            'Precision', 'Recall', 'F1-Score',
            'RT Avg (ms)', 'RT Min (ms)', 'RT Max (ms)', 'RT Median (ms)'
        ])
        for r in results:
            writer.writerow([
                r['id'], r['type'], r['query_thai'],
                r['expected_count'], r['retrieved_count'],
                r['precision'], r['recall'], r['f1_score'],
                r['response_time_avg_ms'], r['response_time_min_ms'],
                r['response_time_max_ms'], r['response_time_median_ms'],
            ])

        # Summary rows
        writer.writerow([])
        writer.writerow(['=== สรุปผลรวม ==='])
        for section, label in [('overall', 'รวม'), ('basic_search', 'ค้นหาพื้นฐาน'), ('semantic_search', 'ค้นหาเชิงความหมาย')]:
            s = summary[section]
            writer.writerow([
                label, '', f"จำนวน {s['total_queries']} queries", '', '',
                s['avg_precision'], s['avg_recall'], s['avg_f1'],
                s['avg_response_time_ms'], '', '', ''
            ])

    print(f"\nCSV exported: {csv_path}")
    return csv_path


def export_json(results, summary, output_dir):
    """ส่งออกผลลัพธ์เป็น JSON"""
    json_path = os.path.join(output_dir, 'evaluation_results.json')
    output = {
        'metadata': {
            'title': 'ผลการประเมินระบบฐานข้อมูลออนโทโลยีวิสาหกิจชุมชน จ.สกลนคร',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'num_rounds_per_query': 5,
        },
        'summary': summary,
        'results': results,
    }
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"JSON exported: {json_path}")
    return json_path


def generate_charts(results, summary, output_dir):
    """สร้างกราฟ"""
    # Try to use a Thai font if available
    thai_fonts = [f for f in fm.findSystemFonts() if 'Sarabun' in f or 'NotoSansThai' in f or 'TH' in f]
    if thai_fonts:
        plt.rcParams['font.family'] = fm.FontProperties(fname=thai_fonts[0]).get_name()
    else:
        plt.rcParams['font.family'] = 'DejaVu Sans'

    ids = [str(r['id']) for r in results]
    precisions = [r['precision'] for r in results]
    recalls = [r['recall'] for r in results]
    f1s = [r['f1_score'] for r in results]
    avg_rts = [r['response_time_avg_ms'] for r in results]
    types = [r['type'] for r in results]

    colors_basic = '#065F46'
    colors_semantic = '#EA580C'
    type_colors = [colors_basic if t == 'basic' else colors_semantic for t in types]

    # === Chart 1: Precision/Recall Bar Chart ===
    fig, ax = plt.subplots(figsize=(14, 6))
    x = np.arange(len(ids))
    width = 0.35
    bars1 = ax.bar(x - width/2, precisions, width, label='Precision', color='#065F46', alpha=0.85)
    bars2 = ax.bar(x + width/2, recalls, width, label='Recall', color='#EA580C', alpha=0.85)
    ax.set_xlabel('Query ID')
    ax.set_ylabel('Score')
    ax.set_title('Precision & Recall per Query')
    ax.set_xticks(x)
    ax.set_xticklabels(ids)
    ax.legend()
    ax.set_ylim(0, 1.1)
    ax.axhline(y=1.0, color='gray', linestyle='--', alpha=0.3)
    # Add separator between basic and semantic
    ax.axvline(x=9.5, color='gray', linestyle=':', alpha=0.5)
    ax.text(4.5, 1.05, 'Basic Search', ha='center', fontsize=9, color='gray')
    ax.text(14.5, 1.05, 'Semantic Search', ha='center', fontsize=9, color='gray')
    plt.tight_layout()
    chart1_path = os.path.join(output_dir, 'precision_recall_chart.png')
    plt.savefig(chart1_path, dpi=150)
    plt.close()
    print(f"Chart saved: {chart1_path}")

    # === Chart 2: Response Time Line Chart ===
    fig, ax = plt.subplots(figsize=(14, 5))
    ax.plot(ids, avg_rts, 'o-', color='#D97706', linewidth=2, markersize=6)
    for i, (xi, rt) in enumerate(zip(ids, avg_rts)):
        ax.annotate(f'{rt:.0f}', (xi, rt), textcoords="offset points",
                   xytext=(0, 10), ha='center', fontsize=8)
    ax.set_xlabel('Query ID')
    ax.set_ylabel('Response Time (ms)')
    ax.set_title('Average Response Time per Query')
    ax.axvline(x='10', color='gray', linestyle=':', alpha=0.5)
    ax.text('5', max(avg_rts) * 0.95, 'Basic', ha='center', fontsize=9, color='gray')
    ax.text('15', max(avg_rts) * 0.95, 'Semantic', ha='center', fontsize=9, color='gray')
    plt.tight_layout()
    chart2_path = os.path.join(output_dir, 'response_time_chart.png')
    plt.savefig(chart2_path, dpi=150)
    plt.close()
    print(f"Chart saved: {chart2_path}")

    # === Chart 3: Response Time Box Plot ===
    basic_rts = []
    semantic_rts = []
    for r in results:
        if r['type'] == 'basic':
            basic_rts.extend(r['response_times'])
        else:
            semantic_rts.extend(r['response_times'])

    fig, ax = plt.subplots(figsize=(8, 6))
    bp = ax.boxplot([basic_rts, semantic_rts],
                    tick_labels=['Basic Search', 'Semantic Search'],
                    patch_artist=True,
                    boxprops=dict(facecolor='lightblue'),
                    medianprops=dict(color='red', linewidth=2))
    bp['boxes'][0].set_facecolor('#D1FAE5')
    bp['boxes'][1].set_facecolor('#FFEDD5')
    ax.set_ylabel('Response Time (ms)')
    ax.set_title('Response Time Distribution: Basic vs Semantic')
    plt.tight_layout()
    chart3_path = os.path.join(output_dir, 'response_time_boxplot.png')
    plt.savefig(chart3_path, dpi=150)
    plt.close()
    print(f"Chart saved: {chart3_path}")

    # === Chart 4: Summary Comparison ===
    fig, axes = plt.subplots(1, 3, figsize=(14, 5))
    metrics = ['avg_precision', 'avg_recall', 'avg_f1']
    titles = ['Average Precision', 'Average Recall', 'Average F1-Score']
    for ax, metric, title in zip(axes, metrics, titles):
        basic_val = summary['basic_search'][metric]
        semantic_val = summary['semantic_search'][metric]
        bars = ax.bar(['Basic', 'Semantic'], [basic_val, semantic_val],
                      color=['#065F46', '#EA580C'], alpha=0.85)
        ax.set_title(title)
        ax.set_ylim(0, 1.1)
        for bar, val in zip(bars, [basic_val, semantic_val]):
            ax.text(bar.get_x() + bar.get_width() / 2., bar.get_height() + 0.02,
                   f'{val:.3f}', ha='center', fontsize=11, fontweight='bold')
    plt.tight_layout()
    chart4_path = os.path.join(output_dir, 'comparison_chart.png')
    plt.savefig(chart4_path, dpi=150)
    plt.close()
    print(f"Chart saved: {chart4_path}")


def print_report(results, summary):
    """แสดงรายงานบนหน้าจอ"""
    print("\n" + "=" * 80)
    print("  ผลการประเมินระบบฐานข้อมูลออนโทโลยีวิสาหกิจชุมชน จ.สกลนคร")
    print("=" * 80)

    print(f"\n{'ID':>3} {'ประเภท':>10} {'Prec':>7} {'Recall':>7} {'F1':>7} {'RT(ms)':>8}  คำถาม")
    print("-" * 80)
    for r in results:
        t = 'พื้นฐาน' if r['type'] == 'basic' else 'ความหมาย'
        print(f"{r['id']:>3} {t:>10} {r['precision']:>7.4f} {r['recall']:>7.4f} "
              f"{r['f1_score']:>7.4f} {r['response_time_avg_ms']:>8.1f}  {r['query_thai']}")

    print("\n" + "=" * 80)
    print("  สรุปผลรวม")
    print("=" * 80)

    for section, label in [
        ('overall', 'รวมทั้งหมด'),
        ('basic_search', 'ค้นหาพื้นฐาน'),
        ('semantic_search', 'ค้นหาเชิงความหมาย'),
    ]:
        s = summary[section]
        print(f"\n  {label} ({s['total_queries']} queries):")
        print(f"    Precision เฉลี่ย : {s['avg_precision']:.4f}")
        print(f"    Recall เฉลี่ย    : {s['avg_recall']:.4f}")
        print(f"    F1-Score เฉลี่ย  : {s['avg_f1']:.4f}")
        print(f"    Response Time    : {s['avg_response_time_ms']:.2f} ms")

    print("\n" + "=" * 80)


# === Main ===

def main():
    parser = argparse.ArgumentParser(
        description='ประเมินประสิทธิภาพระบบฐานข้อมูลออนโทโลยีวิสาหกิจชุมชน จ.สกลนคร'
    )
    parser.add_argument('--api-url', default='http://localhost:5050/api',
                       help='URL ของ API (default: http://localhost:5050/api)')
    parser.add_argument('--queries', default='test_queries.json',
                       help='ไฟล์ชุดคำถามทดสอบ (default: test_queries.json)')
    parser.add_argument('--output', default='results/',
                       help='โฟลเดอร์เก็บผลลัพธ์ (default: results/)')
    parser.add_argument('--rounds', type=int, default=5,
                       help='จำนวนรอบทดสอบต่อ query (default: 5)')
    args = parser.parse_args()

    # โหลดชุดคำถาม
    queries_path = os.path.join(os.path.dirname(__file__), args.queries)
    with open(queries_path, 'r', encoding='utf-8') as f:
        test_data = json.load(f)

    queries = test_data['queries']
    print(f"โหลดชุดคำถาม: {len(queries)} ข้อ")
    print(f"API URL: {args.api_url}")
    print(f"จำนวนรอบ: {args.rounds}")

    # ตรวจสอบ API
    try:
        resp = requests.get(f"{args.api_url}/health", timeout=5)
        health = resp.json()
        print(f"สถานะ API: {health.get('status', 'unknown')}")
        print(f"Fuseki: {health.get('fuseki', {}).get('triple_count', '?')} triples")
    except Exception as e:
        print(f"[WARNING] ไม่สามารถเชื่อมต่อ API: {e}")
        return

    # สร้างโฟลเดอร์ output
    output_dir = os.path.join(os.path.dirname(__file__), args.output)
    os.makedirs(output_dir, exist_ok=True)

    # ประเมิน
    print("\n" + "=" * 50)
    print("  เริ่มการประเมิน...")
    print("=" * 50)
    results = run_evaluation(args.api_url, queries, args.rounds)

    # สรุปผล
    summary = generate_summary(results)

    # แสดงรายงาน
    print_report(results, summary)

    # ส่งออก
    export_csv(results, summary, output_dir)
    export_json(results, summary, output_dir)

    # สร้างกราฟ
    try:
        generate_charts(results, summary, output_dir)
    except Exception as e:
        print(f"[WARNING] ไม่สามารถสร้างกราฟ: {e}")

    print(f"\nผลลัพธ์ทั้งหมดอยู่ในโฟลเดอร์: {output_dir}")


if __name__ == '__main__':
    main()
