#!/usr/bin/env python3
"""
Spočítá CAD-correct geometrii Graham deadbeat eskapementu:
- Lock arc radius (kruhový oblouk soustředný s pivot kotvy, po kterém
  klouže zub během lock fáze)
- Contact body (kde zub fyzicky dotýká palety)
- SVG arc paths pro helper lines

Per Saunier 1875, CAD Journal Vol.4 2007 (Tam et al, Fig.15):
- Standard Graham anchor span = 90° z wheel center (= 7.5 zubů z 30)
- Tooth tip kde paleta chytá: at angle 45° from vertical z wheel center
- Lock arc radius vychází z geometrie wheel + anchor pivot positions

Použití:
  python3 pal-contact.py [pivot_x pivot_y wheel_cx wheel_cy R_t [anchor_span_deg]]

Default: Graham pilot (anchor pivot (242, 42.7), wheel center (239.5, 372.6),
R_t=236.3, anchor span 90°).
"""
import math
import sys

# Default Graham geometry
pivot = (242, 42.7)
wheel_center = (239.5, 372.6)
R_t = 236.3
anchor_span = 90  # degrees, paper-standard for Graham

if len(sys.argv) >= 6:
    pivot = (float(sys.argv[1]), float(sys.argv[2]))
    wheel_center = (float(sys.argv[3]), float(sys.argv[4]))
    R_t = float(sys.argv[5])
    if len(sys.argv) >= 7:
        anchor_span = float(sys.argv[6])

D = math.hypot(wheel_center[0] - pivot[0], wheel_center[1] - pivot[1])

# Tooth contact at angle (anchor_span/2) from vertical (z wheel center)
half_span = math.radians(anchor_span / 2)
sin_a = math.sin(half_span)
cos_a = math.cos(half_span)

# Contact points (assumes wheel center is roughly directly below pivot)
left_tooth = (wheel_center[0] - R_t * sin_a, wheel_center[1] - R_t * cos_a)
right_tooth = (wheel_center[0] + R_t * sin_a, wheel_center[1] - R_t * cos_a)

# Lock arc radius = distance from pivot to tooth contact (symmetric)
r_lock = math.hypot(left_tooth[0] - pivot[0], left_tooth[1] - pivot[1])

# Arc endpoints for helper lines (visualize ±18° around contact, ~36° span)
def arc_endpoints(center, r, contact, span_deg=36):
    angle = math.atan2(contact[1] - center[1], contact[0] - center[0])
    a1 = angle - math.radians(span_deg / 2)
    a2 = angle + math.radians(span_deg / 2)
    p1 = (center[0] + r * math.cos(a1), center[1] + r * math.sin(a1))
    p2 = (center[0] + r * math.cos(a2), center[1] + r * math.sin(a2))
    return p1, p2

left_start, left_end = arc_endpoints(pivot, r_lock, left_tooth)
right_start, right_end = arc_endpoints(pivot, r_lock, right_tooth)

print(f"=== INPUT ===")
print(f"Anchor pivot:    ({pivot[0]}, {pivot[1]})")
print(f"Wheel center:    ({wheel_center[0]}, {wheel_center[1]})")
print(f"R_t:             {R_t}")
print(f"Anchor span:     {anchor_span}° (= {anchor_span/12:.1f} zubů z 30)")
print(f"D (mech dist):   {D:.2f}")
print()
print(f"=== COMPUTED ===")
print(f"r_lock (sym):    {r_lock:.2f}")
print()
print(f"Pallet highlight positions (use as <circle cx=... cy=...>):")
print(f"  LEFT:  cx={left_tooth[0]:.2f}, cy={left_tooth[1]:.2f}")
print(f"  RIGHT: cx={right_tooth[0]:.2f}, cy={right_tooth[1]:.2f}")
print()
print(f"Helper arc paths (sepia dashed, opacity ~0.45):")
print(f"  LEFT:  <path d=\"M {left_start[0]:.2f},{left_start[1]:.2f} "
      f"A {r_lock:.2f},{r_lock:.2f} 0 0 1 {left_end[0]:.2f},{left_end[1]:.2f}\"/>")
print(f"  RIGHT: <path d=\"M {right_start[0]:.2f},{right_start[1]:.2f} "
      f"A {r_lock:.2f},{r_lock:.2f} 0 0 1 {right_end[0]:.2f},{right_end[1]:.2f}\"/>")
