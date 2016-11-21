from collections import defaultdict

from bulk_update.helper import bulk_update

from django.conf import settings


class StatsUpdater:

    def __init__(self, stats_cls, related_model_id_name):
        self.stats_cls = stats_cls
        self.related_model_id_name = related_model_id_name

        self.current_stats = {
            getattr(stats_obj, related_model_id_name): stats_obj for stats_obj in stats_cls.objects.all()}
        self.current_stats_ids = set(self.current_stats.keys())
        self.stats_to_create = []
        self.stats_to_update = []

        self.created_stats_number = 0
        self.updated_stats_number = 0

    def process_batch_to_create(self):
        self.stats_cls.objects.bulk_create(self.stats_to_create)
        self.created_stats_number += len(self.stats_to_create)
        self.stats_to_create = []

    def process_batch_to_update(self):
        bulk_update(self.stats_to_update)
        self.updated_stats_number += len(self.stats_to_update)
        self.stats_to_update = []

    @staticmethod
    def parse_logs(file_name):
        counter = defaultdict(lambda: 0)
        with open(file_name) as log_file:
            for line in log_file:
                counter[int(line.strip())] += 1
        return counter

    def run(self, clicked_file, shown_file):
        shown_counter = self.parse_logs(shown_file)
        clicked_counter = self.parse_logs(clicked_file)
        counter_keys = set(list(shown_counter.keys()) + list(clicked_counter.keys()))

        for stats_id in counter_keys:
            times_shown = shown_counter[stats_id]
            times_clicked = clicked_counter[stats_id]

            if stats_id not in self.current_stats_ids:
                stats_obj = self.stats_cls(
                    times_clicked=times_clicked,
                    times_shown=times_shown
                )
                setattr(stats_obj, self.related_model_id_name, stats_id)
                self.stats_to_create.append(stats_obj)
            else:
                stats_obj = self.current_stats[stats_id]
                stats_obj.times_shown = times_shown
                stats_obj.times_clicked = times_clicked
                self.stats_to_update.append(stats_obj)

            if len(self.stats_to_create) > settings.BATCH_SIZE:
                self.process_batch_to_create()
            if len(self.stats_to_update) > settings.BATCH_SIZE:
                self.process_batch_to_update()

        if self.stats_to_create:
            self.process_batch_to_create()
        if self.stats_to_update:
            self.process_batch_to_update()

        return self.created_stats_number, self.updated_stats_number
