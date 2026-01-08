import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
print(Path('app/[locale]/layout.tsx').read_text(encoding='utf-8'))
