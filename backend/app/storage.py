class ImageStorage:
    def __init__(self):
        self._store = {}

    def save(self, image_id: str, image):
        self._store[image_id] = image

    def get(self, image_id: str):
        return self._store.get(image_id)
    
    def save_preview(self, image_id: str, image):
        self._store[image_id] = image
    
    def get_preview(self, image_id: str):
        return self._store.get(image_id)