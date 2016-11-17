import os
import re

from collections import Counter

from django.conf import settings
from bulk_update.helper import bulk_update


LOG_DIR = os.path.join(settings.DJANGO_ROOT, 'apps', 'reports', 'fake_logs')


def update_stats(stats_cls, related_model_name):
    current_stats = {
        getattr(stats_obj, related_model_name): stats_obj for stats_obj in stats_cls.objects.all()}
    current_stats_ids = set(current_stats.keys())
    stats_to_create = []
    stats_to_update = []

    created_stats_count = 0
    updated_stats_count = 0

    shown_counter = parse_logs(LOG_DIR)
    clicked_counter = parse_logs(LOG_DIR)

    counter_keys = set(list(shown_counter) + list(clicked_counter))

    for stats_id in counter_keys:
        times_shown = shown_counter.get(stats_id, 0)
        times_clicked = clicked_counter.get(stats_id, 0)

        if stats_id not in current_stats_ids:
            stats_obj = stats_cls(
                times_clicked=times_clicked,
                times_shown=times_shown
            )
            setattr(stats_obj, related_model_name, stats_id)
            stats_to_create.append(stats_obj)
        else:
            stats_obj = current_stats[stats_id]
            stats_obj.times_shown = times_shown
            stats_obj.times_clicked = times_clicked
            stats_to_update.append(stats_obj)

        if len(stats_to_create) > settings.BATCH_SIZE:
            stats_cls.objects.bulk_create(stats_to_create)
            created_stats_count += len(stats_to_create)
            stats_to_create = []

        if len(stats_to_update) > settings.BATCH_SIZE:
            bulk_update(stats_to_update)
            updated_stats_count += len(stats_to_update)
            stats_to_update = []

    if stats_to_create:
        stats_cls.objects.bulk_create(stats_to_create)
        created_stats_count += len(stats_to_create)
        stats_to_create = []
    if stats_to_update:
        bulk_update(stats_to_update)
        updated_stats_count += len(stats_to_update)
        stats_to_update = []

    return created_stats_count, updated_stats_count


def parse_logs(directory):
    ids = []
    log_files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
    for file_name in log_files:
        with open(os.path.join(directory, file_name)) as log_file:
            ids.extend(map(int, re.findall(r'\b\d+\b', log_file.read())))
    cntr = Counter(ids)
    return cntr
