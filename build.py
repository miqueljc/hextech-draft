#!/usr/bin/env python3
"""Genera pc.html (escriptori) i index.html (mòbil) a partir de src/. Ús: python3 build.py"""
import os, runpy
here = os.path.dirname(os.path.abspath(__file__))
runpy.run_path(os.path.join(here, 'src', 'app', 'build_desktop.py'), run_name='__main__')
runpy.run_path(os.path.join(here, 'src', 'mobile', 'build_mobile.py'), run_name='__main__')
