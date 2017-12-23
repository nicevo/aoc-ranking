#!/usr/bin/env python

from collections import defaultdict
from collections import Counter
import json
import sys

data = json.load(sys.stdin)

max_points_per_star = len(data['members'])
members = sorted(data['members'].keys())

days = set()
times_per_part = defaultdict(list)
for member, scores in data['members'].items():
    for day, parts in scores['completion_day_level'].items():
        day = day.zfill(2)
        days.add(day)
        for part, part_time in parts.items():
            times_per_part['{}.{}'.format(day, part)].append((member, part_time['get_star_ts']))

parts = sorted(times_per_part.keys())
days = sorted(list(days))

scores = defaultdict(Counter)
stars = defaultdict(Counter)
ranks = defaultdict(Counter)
totals = defaultdict(Counter)
total_per_member = Counter()

for part in parts:
    day = part[:-2]
    order = [times[0] for times in sorted(times_per_part[part], key=lambda x: x[1])]

    for member in members:
        if member in order:
            rank = order.index(member) + 1
            score = max_points_per_star - rank + 1
            star = 1
        else:
            rank = 0
            score = 0
            star = 0

        scores[member][day] += score
        ranks[member][day] = rank
        stars[member][day] += star
        total_per_member[member] += score
        totals[member][day] = total_per_member[member]

totals_per_day = defaultdict(lambda: [])
for member in members:
    for day in days:
        totals_per_day[day].append((member, totals[member][day]))
overall_ranks = defaultdict(Counter)
for day in days:
    order = [t[0] for t in sorted(totals_per_day[day], key=lambda x: -x[1])]
    for member in members:
        overall_ranks[member][day] = order.index(member) + 1

ranking = []
for member in members:
    ranking.append({
        'id': data['members'][member]['id'],
        'name': data['members'][member]['name'],
        'scores': [s for _, s in sorted(scores[member].items())],
        'stars': [s for _, s in sorted(stars[member].items())],
        'ranks': [s for _, s in sorted(ranks[member].items())],
        'totals': [s for _, s in sorted(totals[member].items())],
        'overall_ranks': [s for _, s in sorted(overall_ranks[member].items())],
    })

print(json.dumps({'ranking': ranking}, indent=4, sort_keys=True))
