#!/usr/bin/env python3
"""Genera pc.html (escriptori) i index.html (mòbil) a partir de src/ (vegeu src/muntatge.py). Ús: python3 build.py"""
import os, runpy
runpy.run_path(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'muntatge.py'), run_name='__main__')
