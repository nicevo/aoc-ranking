#!/usr/bin/env python

from collections import defaultdict
from collections import Counter
import json
import sys

data = json.load(sys.stdin)

max_points_per_star = len(data['members'])
members = data['members'].keys()

times_per_part = defaultdict(list)
for member, scores in data['members'].items():
    for day, parts in scores['completion_day_level'].items():
        for part, part_time in parts.items():
            times_per_part['{}.{}'.format(day.zfill(2), part)].append((member, part_time['get_star_ts']))

parts = sorted(times_per_part.keys())

scores_per_part = defaultdict(Counter)
scores_per_day = defaultdict(Counter)
stars_per_day = defaultdict(Counter)
rank_per_part = defaultdict(Counter)
rank_per_day = defaultdict(Counter)
for part, stars in times_per_part.items():
    stars = sorted(stars, key=lambda x: x[1])
    times_per_part[part] = stars

    score = max_points_per_star
    rank = 1
    for member, star in stars:
        scores_per_part[member][part] = score
        scores_per_day[member][part[:-2]] += score
        stars_per_day[member][part[:-2]] += 1
        rank_per_part[member][part] = rank
        rank_per_day[member][part[:-2]] = rank
        score -= 1
        rank += 1

totals_member_part = defaultdict(Counter)
totals_member_day = defaultdict(Counter)
totals_part_member = defaultdict(Counter)
totals_day_member = defaultdict(Counter)
for member in members:
    total = 0
    for part in parts:
        total += scores_per_part[member][part]
        totals_member_part[member][part] = total
        totals_member_day[member][part[:-2]] = total
        totals_part_member[part][member] = total
        totals_day_member[part[:-2]][member] = total

overall_rank_per_part = defaultdict(Counter)
overall_rank_per_day = defaultdict(Counter)
for part in parts:
    rank = 1
    for member, score in sorted(totals_part_member[part].items(), key=lambda x: -x[1]):
        overall_rank_per_part[member][part] = rank
        overall_rank_per_day[member][part[:-2]] = rank
        rank += 1

scores = []
for member in members:
    scores.append({
        'id': data['members'][member]['id'],
        'name': data['members'][member]['name'],
        'scores_per_day': [s for _, s in sorted(scores_per_day[member].items())],
        'stars_per_day': [s for _, s in sorted(stars_per_day[member].items())],
        'rank_per_day': [s for _, s in sorted(rank_per_day[member].items())],
        'totals_member_day': [s for _, s in sorted(totals_member_day[member].items())],
        'overall_rank_per_day': [s for _, s in sorted(overall_rank_per_day[member].items())],
    })

print(json.dumps({'scores': scores}))
