#!/usr/bin/env python
"""
__author__ = 'loong'
"""
import glob
import re
import sys

jsname = sys.argv[1]
ver = sys.argv[2]

regstr = '({})([0-9]+)'.format(re.escape(jsname + '?ver='))

print(regstr)
regex = re.compile(regstr)

for filename in glob.glob('./*.html'):
    content = open(filename).read()
    open(filename, 'w').write(re.sub(regex, r'\g<1>' + ver, content))
