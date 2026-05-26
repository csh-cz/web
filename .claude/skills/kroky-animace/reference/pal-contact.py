#!/usr/bin/env python3
"""
Spočítá REÁLNÉ pozice kontaktních bodů zub × paleta v Graham (či jiném
dead-beat) eskapementu — pro správné umístění highlight markerů v SVG.

Geometrie:
- Anchor pivot (ap_x, ap_y) — osa otáčení kotvy
- Wheel center (wc_x, wc_y) — osa otáčení kola
- Wheel tooth tip radius R_t — vzdálenost od wheel center k vrcholu zubu
- Pallet lock arc radius r_p — vzdálenost od anchor pivot k lock face palety
  (left pallet OUTER edge = larger r, right pallet INNER edge = smaller r)

Kontakt zub × paleta = průsečík dvou kruhů:
- Circle 1: |P - anchor_pivot| = r_p
- Circle 2: |P - wheel_center| = R_t

Použití:
  python3 pal-contact.py [ap_x ap_y wc_x wc_y R_t r_left r_right]

Default = Graham pilot values.
"""
import math
import sys

# Default Graham geometry
ap = (242, 42.7)
wc = (239.5, 372.6)
R_t = 236.3
r_left = 243   # OUTER edge of LEFT pallet (lock face)
r_right = 222  # INNER edge of RIGHT pallet (lock face)

if len(sys.argv) >= 8:
    ap = (float(sys.argv[1]), float(sys.argv[2]))
    wc = (float(sys.argv[3]), float(sys.argv[4]))
    R_t = float(sys.argv[5])
    r_left = float(sys.argv[6])
    r_right = float(sys.argv[7])

D = math.hypot(wc[0] - ap[0], wc[1] - ap[1])

def contact(r_p, sign):
    """Return SVG-coord (x, y) of pallet contact on given side.
    sign = -1 for left, +1 for right (relative to anchor-wheel axis).
    Assumes wheel center is roughly DIRECTLY below anchor pivot."""
    # In rotated frame where anchor is origin, wheel center at (0, D):
    # x² + y² = r_p²
    # x² + (y-D)² = R_t²
    # → y = (D² + r_p² - R_t²) / (2D)
    y = (D*D + r_p*r_p - R_t*R_t) / (2*D)
    x2 = r_p*r_p - y*y
    if x2 < 0:
        return None
    x = math.sqrt(x2)
    return (ap[0] + sign * x, ap[1] + y)

left_contact = contact(r_left, -1)
right_contact = contact(r_right, +1)

print(f"Anchor pivot:      ({ap[0]}, {ap[1]})")
print(f"Wheel center:      ({wc[0]}, {wc[1]})")
print(f"D (mech distance): {D:.2f}")
print(f"Tooth tip radius:  {R_t}")
print(f"Left pal arc:      r={r_left}")
print(f"Right pal arc:     r={r_right}")
print()
print(f"LEFT contact:  ({left_contact[0]:.1f}, {left_contact[1]:.1f})")
print(f"RIGHT contact: ({right_contact[0]:.1f}, {right_contact[1]:.1f})")
print()
print("Použij tyto pozice pro pallet highlight `<circle cx=... cy=...>` markery")
print("v animační groupě kotvy. Ne `inner edge V tipu` (to je vizuálně blízko ale fyzicky off).")
