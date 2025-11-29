import requests
from pathlib import Path

csv_path = Path('synthetic_transactions.csv')
with csv_path.open('rb') as handle:
    files = {'file': (csv_path.name, handle, 'text/csv')}
    response = requests.post('http://127.0.0.1:8000/api/v1/ingest/csv', files=files, timeout=30)
print(response.status_code)
print(response.json())

