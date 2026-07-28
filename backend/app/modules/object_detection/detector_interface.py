from abc import ABC, abstractmethod

import numpy as np
from app.entities.pore_object import PoreObject


class DetectorInterface(ABC):
    @abstractmethod
    def detect(self, mask: np.ndarray) -> list[PoreObject]:

        pass
