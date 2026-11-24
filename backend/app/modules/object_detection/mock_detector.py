import numpy as np
from skimage.measure import label, regionprops

from app.config.config_loader import APP_SETTINGS
from app.entities.pore_object import PoreObject
from app.modules.object_detection.detector_interface import DetectorInterface


class MockDetector(DetectorInterface):
    def detect(self, mask: np.ndarray) -> list[PoreObject]:
        settings = APP_SETTINGS["object_detection"]

        min_object_area = int(settings["min_object_area"])
        connectivity = int(settings["connectivity"])
        return_bounding_box = bool(settings["return_bounding_box"])
        return_centroid = bool(settings["return_centroid"])
        return_object_mask = bool(settings["return_object_mask"])

        if mask.ndim == 3:
            if mask.shape[-1] == 1:
                mask = mask[..., 0]
            else:
                mask = mask[:, :, 0]
        detection_mask = np.logical_not(mask)

        # В settings.json связность задаётся в конвенции OpenCV (4/8),
        # а skimage.measure.label для 2D ожидает 1 или 2.
        skimage_connectivity = 2 if connectivity == 8 else 1
        labeled_mask = label(detection_mask, connectivity=skimage_connectivity)

        regions = regionprops(labeled_mask)

        detected_objects = []

        for index, region in enumerate(regions):
            if region.area < min_object_area:
                continue

            perimeter = region.perimeter

            roundness = None

            if perimeter > 0:
                roundness = 4 * np.pi * region.area / (perimeter**2)

            if hasattr(region, "equivalent_diameter_area"):
                equivalent_diameter = region.equivalent_diameter_area
            else:
                equivalent_diameter = region.equivalent_diameter

            centroid = (
                (float(region.centroid[0]), float(region.centroid[1]))
                if return_centroid
                else None
            )
            bounding_box = (
                (
                    int(region.bbox[0]),
                    int(region.bbox[1]),
                    int(region.bbox[2]),
                    int(region.bbox[3]),
                )
                if return_bounding_box
                else None
            )

            pore_object = PoreObject(
                object_id=index + 1,
                area=float(region.area),
                perimeter=float(perimeter),
                centroid=centroid,
                equivalent_diameter=float(equivalent_diameter),
                bounding_box=bounding_box,
                roundness=roundness,
                object_mask=(
                    region.image.astype(np.uint8) if return_object_mask else None
                ),
            )

            detected_objects.append(pore_object)

        return detected_objects
