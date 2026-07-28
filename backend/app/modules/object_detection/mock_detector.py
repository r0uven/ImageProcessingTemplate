import numpy as np
from app.config.config_loader import APP_SETTINGS
from app.entities.pore_object import PoreObject
from app.modules.object_detection.detector_interface import DetectorInterface
from skimage.measure import label, regionprops


class MockDetector(DetectorInterface):
    def detect(self, mask: np.ndarray) -> list[PoreObject]:

        settings = APP_SETTINGS["object_detection"]

        min_object_area = settings["min_object_area"]

        if mask.ndim == 3:
            if mask.shape[-1] == 1:
                mask = mask[..., 0]
            else:
                mask = mask[:, :, 0]
        detection_mask = np.logical_not(mask)

        labeled_mask = label(detection_mask)

        regions = regionprops(labeled_mask)

        detected_objects = []

        for index, region in enumerate(regions):
            if region.area < min_object_area:
                continue

            perimeter = region.perimeter

            roundness = None

            if perimeter > 0:
                roundness = 4 * np.pi * region.area / (perimeter**2)

            pore_object = PoreObject(
                object_id=index + 1,
                area=float(region.area),
                perimeter=float(perimeter),
                centroid=(float(region.centroid[0]), float(region.centroid[1])),
                equivalent_diameter=float(region.equivalent_diameter),
                bounding_box=region.bbox,
                roundness=roundness,
            )

            detected_objects.append(pore_object)

        return detected_objects
