"""
Reads simple written notes and generates an entry for csv
"""

""" INSTRUCTIONS

Input: [SERVING] [UNIT] of [NAME,*INFO] has [CALORIES] [PROTEIN] [CARBS] [FAT] from [SOURCE] [*BRAND] alt [*ALT UNITS] tag [*TAG]
Example: 100 g of ground beef, raw has 293 16 0 25 from USDA alt oz tag protein

*: Not required

"""

import re, csv, io, subprocess, sys

import re, csv, io, subprocess, sys

LINE_RE = re.compile(
    r'^(?P<serving>[\d.]+)\s+(?P<unit>\S+)\s+of\s+(?P<name>.+?)\s+has\s+'
    r'(?P<macros>[-\d.\s]+?)\s+from\s+(?P<rest>.+)$', re.IGNORECASE)

def parse_line(line):
    m = LINE_RE.match(line.strip())
    serving, unit, name = m.group('serving'), m.group('unit'), m.group('name').strip()
    calories, protein, carbs, fat = m.group('macros').split()
    rest = m.group('rest').strip()

    tag = alt = brand = source = ''
    if tm := re.search(r'\btag\s+(\S+)', rest, re.IGNORECASE):
        tag, rest = tm.group(1), rest[:tm.start()].strip()
    if am := re.search(r'\balt\s+(\S+)', rest, re.IGNORECASE):
        alt, rest = am.group(1), rest[:am.start()].strip()
    if bm := re.match(r'^brand\s+(.+)$', rest, re.IGNORECASE):
        brand = bm.group(1).strip()
        source = 'BRAND'
    else:
        source = rest.strip()

    id_slug = re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', name.lower())).strip('-')
    return [id_slug, name, serving, unit, calories, protein, carbs, fat, source, brand, alt, '', tag]

def copy(text):
    if sys.platform == 'darwin':
        subprocess.run('pbcopy', input=text, text=True)
    elif sys.platform.startswith('win'):
        subprocess.run('clip', input=text, text=True)
    else:
        subprocess.run(['xclip', '-selection', 'clipboard'], input=text.encode())

lines = []
print("")
while line := input('> '):
    lines.append(line)

buf = io.StringIO()
w = csv.writer(buf)
for line in lines:
    w.writerow(parse_line(line))
out = buf.getvalue().strip()
print("\n"+out)
print(f"\n\033[92mCOMPLETE\033[0m: Data processed & copied to clipboard\n")
copy(out)