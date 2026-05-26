#!/usr/bin/env python3
"""
Generuje values/keyTimes pro discrete tick animaci krokového kola
v SVG bez accumulate="sum" (kvůli Chrome bugu).

Použití:
  python3 wheel-ticks.py [ticks] [cx] [cy] [dur_seconds]

Default: 30 ticks po 12°, kolem (239.5, 372.6), dur 60s.

Output: copy-pasteable values + keyTimes attributes do <animateTransform>.
"""
import sys

ticks = int(sys.argv[1]) if len(sys.argv) > 1 else 30
cx = float(sys.argv[2]) if len(sys.argv) > 2 else 239.5
cy = float(sys.argv[3]) if len(sys.argv) > 3 else 372.6
dur = int(sys.argv[4]) if len(sys.argv) > 4 else 60

deg_per_tick = 360 / ticks

values = []
keyTimes = []
for i in range(ticks):
    angle = i * deg_per_tick
    # Start of tick interval: hold at angle (still locked from previous)
    keyTimes.append(i / ticks)
    values.append(f"{angle:g} {cx} {cy}")
    # End of hold (90% through interval): just before jump
    keyTimes.append((i + 0.9) / ticks)
    values.append(f"{angle:g} {cx} {cy}")
# Final keyframe at t=1: angle = 360°
keyTimes.append(1)
values.append(f"360 {cx} {cy}")

print(f"<!-- {ticks} ticks × {deg_per_tick:g}° = 360° za {dur}s, hold 90% + jump 10% -->")
print(f'values="{"; ".join(values)}"')
print(f'keyTimes="{"; ".join(f"{t:.5f}".rstrip("0").rstrip(".") for t in keyTimes)}"')
print(f'dur="{dur}s"')
print(f'<!-- Total: {len(values)} values, {len(keyTimes)} keyTimes -->')
