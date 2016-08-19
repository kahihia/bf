from compressor.storage import CompressorFileStorage
from compressor.conf import settings


class AssetFileStorage(CompressorFileStorage):
    def __init__(self, location=None, base_url=None, *args, **kwargs):
        if location is None:
            location = settings.COMPRESS_SOURCE_ROOT
        base_url = None
        super().__init__(location, base_url, *args, **kwargs)
