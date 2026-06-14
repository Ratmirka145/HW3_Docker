import csv
import random
import os
import sys

NUM_ROWS = 50
COLUMNS = ["ORDER_ID", "DELIVERY_MINUTES", "ORDER_AMOUNT", "PAYMENT_TYPE"]


def generate_row():
    return {
        "ORDER_ID": random.randint(1000, 9999),
        "DELIVERY_MINUTES": random.randint(10, 60),
        "ORDER_AMOUNT": round(random.uniform(250.0, 3500.0), 2),
        "PAYMENT_TYPE": random.choice(["card", "cash", "online"]),
    }


OUTPUT_DIR = sys.argv[1] if len(sys.argv) > 1 else "/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "data.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)
rows = [generate_row() for _ in range(NUM_ROWS)]

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=COLUMNS)
    writer.writeheader()
    writer.writerows(rows)
