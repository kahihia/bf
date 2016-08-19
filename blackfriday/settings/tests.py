import sys


if 'test' in sys.argv[:2]:
    class DisableMigrations(object):
        def __contains__(self, item):
            return True

        def __getitem__(self, item):
            return 'notmigrations'

    MIGRATION_MODULES = DisableMigrations()
