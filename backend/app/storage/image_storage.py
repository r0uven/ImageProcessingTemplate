class ImageStorage:
    def __init__(self):
        self._store = {}
        self._preview_store = {}
        self._analysis_store = {}

    def save(self, image_id, image):
        self._store[image_id] = image

    def get(self, image_id):
        return self._store.get(image_id)

    def save_preview(self, image_id, image):
        self._preview_store[image_id] = image

    def get_preview(self, image_id):
        return self._preview_store.get(image_id)

    def save_analysis_image(
        self,
        image_id,
        name,
        image
    ):
        if image_id not in self._analysis_store:
            self._analysis_store[image_id] = {}

        self._analysis_store[image_id][name] = image

    def get_analysis_image(
        self,
        image_id,
        name
    ):
        return (
            self._analysis_store
            .get(image_id, {})
            .get(name)
        )