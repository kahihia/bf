import os
from collections import OrderedDict

from django.conf import settings
from django.contrib.staticfiles.finders import FileSystemFinder
from django.core.files.storage import FileSystemStorage

from compressor.finders import CompressorFinder

from .storages import AssetFileStorage


class AssetFinder(CompressorFinder):
    storage = AssetFileStorage


class BowerFinder(FileSystemFinder):
    def __init__(self, apps=None, *args, **kwargs):
        self.locations = []
        self.storages = OrderedDict()

        root = self._get_bower_components_location()
        if root is not None:
            prefix = ''
            self.locations.append((prefix, root))

            filesystem_storage = FileSystemStorage(location=root)
            filesystem_storage.prefix = prefix
            self.storages[root] = filesystem_storage

    def _get_bower_components_location(self):
        for name in ['bower_components', 'components']:
            path = os.path.join(settings.BOWER_COMPONENTS_ROOT, name)
            if os.path.exists(path):
                return path
