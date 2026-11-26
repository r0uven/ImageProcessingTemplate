import { useCallback, useSyncExternalStore } from "react";

import type { AppSettings } from "@/entities/settings";

import type {
  ProcessingSettingsState,
  WorkspaceState,
} from "./types";

export type {
  ProcessingSettingsState,
  WorkspaceMode,
  WorkspaceState,
  WorkspaceViewerState,
} from "./types";

const STORAGE_PREFIX = "workspace-state-v1:";
const DEFAULT_KEY = "default";

/** Переносит настройки из глобального конфига в редактируемое состояние воркспейса. */
function createDefaultSettings(settings: AppSettings): ProcessingSettingsState {
  return {
    preprocessing: {
      denoise: settings.preprocessing.denoise,
      normalize: settings.preprocessing.normalize,
      contrastEnhancement: settings.preprocessing.contrast_enhancement,
      smoothing: settings.preprocessing.smoothing,
      filterSize: settings.preprocessing.filter_size,
      preserveSize: settings.preprocessing.preserve_size,
    },
    segmentation: {
      method: settings.segmentation.method,
      outputMask: {
        foregroundValue: settings.segmentation.output.foreground_value,
        backgroundValue: settings.segmentation.output.background_value,
        preserveSize: settings.segmentation.output.preserve_size,
      },
      threshold: {
        thresholdValue: settings.segmentation.threshold.threshold_value,
        invert: settings.segmentation.threshold.invert,
      },
      neural: {
        modelType: settings.segmentation.neural.selected_model,
        entities: settings.segmentation.neural.entities,
        defaultConfidenceThreshold:
          settings.segmentation.neural.default_confidence_threshold,
        device: settings.segmentation.neural.device,
      },
    },
    separation: {
      enabled: settings.pore_separation.enabled,
      applyOnlyToCandidates: settings.pore_separation.apply_only_to_candidates,
      preserveAutonomousPores:
        settings.pore_separation.preserve_autonomous_pores,
      keepUnseparatedCandidates:
        settings.pore_separation.keep_unseparated_candidates,
      validateSeparationResult:
        settings.pore_separation.validate_separation_result,
      preserveParentLink: settings.pore_separation.preserve_parent_link,
      evaluateSeparationQuality:
        settings.pore_separation.evaluate_separation_quality,
      qualityMetrics: {
        coveredArea: settings.pore_separation.quality_metrics.covered_area,
        lostArea: settings.pore_separation.quality_metrics.lost_area,
        extraArea: settings.pore_separation.quality_metrics.extra_area,
        coverageRatio: settings.pore_separation.quality_metrics.coverage_ratio,
        extraRatio: settings.pore_separation.quality_metrics.extra_ratio,
      },
      algorithmParams: settings.pore_separation.algorithm_params,
    },
  };
}

function createDefaultState(settings: AppSettings): WorkspaceState {
  return {
    mode: "original",
    viewerState: {
      original: null,
      processed: null,
      annotated: null,
    },
    processingSettings: createDefaultSettings(settings),
    runId: null,
    runFingerprint: null,
  };
}

/**
 * Отпечаток входных данных обработки. Настройки сериализуются целиком,
 * поэтому любое изменение (включая замену изображения) делает старый запуск
 * неактуальным, а возврат настроек к прежним значениям — снова актуальным.
 */
export function createRunFingerprint(
  imageId: string | null,
  processingSettings: ProcessingSettingsState,
): string {
  return JSON.stringify({ imageId, processingSettings });
}

const stateCache = new Map<string, WorkspaceState>();
const listeners = new Map<string, Set<() => void>>();

/** Состояние каждого инструмента (toolId) хранится под отдельным ключом. */
function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function readFromStorage(key: string, settings: AppSettings): WorkspaceState | null {
  // Восстанавливаем состояние поверх актуальных значений по умолчанию:
  // так новые поля из настроек не остаются undefined после обновления.
  try {
    const raw = sessionStorage.getItem(storageKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<WorkspaceState> | null;
    if (!parsed) return null;

    const defaults = createDefaultState(settings);

    return {
      ...defaults,
      ...parsed,
      viewerState: { ...defaults.viewerState, ...parsed.viewerState },
      processingSettings: parsed.processingSettings ?? defaults.processingSettings,
    };
  } catch {
    return null;
  }
}

function persist(key: string, state: WorkspaceState): void {
  try {
    sessionStorage.setItem(storageKey(key), JSON.stringify(state));
  } catch {
    // Приватный режим или заполненное хранилище — состояние останется в памяти.
  }
}

function notify(key: string): void {
  listeners.get(key)?.forEach((listener) => listener());
}

export function getWorkspaceState(
  toolId: string | undefined,
  settings: AppSettings,
): WorkspaceState {
  const key = toolId ?? DEFAULT_KEY;
  const cached = stateCache.get(key);

  if (cached) return cached;

  const state = readFromStorage(key, settings) ?? createDefaultState(settings);
  stateCache.set(key, state);

  return state;
}

export function subscribeWorkspaceState(
  key: string,
  listener: () => void,
): () => void {
  let keyListeners = listeners.get(key);

  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }

  keyListeners.add(listener);

  return () => {
    keyListeners.delete(listener);

    if (keyListeners.size === 0) {
      listeners.delete(key);
    }
  };
}

export function updateWorkspaceState(
  key: string,
  settings: AppSettings,
  updater: (previous: WorkspaceState) => WorkspaceState,
): void {
  // Обновляем кэш, sessionStorage и подписчиков одним атомарным шагом.
  const next = updater(getWorkspaceState(key, settings));

  stateCache.set(key, next);
  persist(key, next);
  notify(key);
}

function storedKeys(): string[] {
  // Ключи в sessionStorage не перечислить напрямую — проходим по индексам.
  const keys: string[] = [];

  try {
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const storageEntry = sessionStorage.key(index);

      if (storageEntry?.startsWith(STORAGE_PREFIX)) {
        keys.push(storageEntry.slice(STORAGE_PREFIX.length));
      }
    }
  } catch {
    // sessionStorage недоступен — очищаем только состояние в памяти.
  }

  return keys;
}

/**
 * Сбрасывает состояние всех страниц обработки. Используется, когда
 * пользователь явно начинает новую обработку с нуля.
 */
export function clearAllWorkspaceStates(): void {
  const keys = new Set([...stateCache.keys(), ...storedKeys()]);

  for (const key of keys) {
    stateCache.delete(key);

    try {
      sessionStorage.removeItem(storageKey(key));
    } catch {
      // Игнорируем недоступное хранилище.
    }

    notify(key);
  }
}

/**
 * Состояние страницы обработки, которое переживает размонтирование страницы:
 * возврат по истории (например, с экрана характеристик) не сбрасывает
 * загруженное изображение, настройки и результат обработки.
 */
export function useWorkspaceState(
  toolId: string | undefined,
  settings: AppSettings,
) {
  const key = toolId ?? DEFAULT_KEY;

  const subscribe = useCallback(
    (listener: () => void) => subscribeWorkspaceState(key, listener),
    [key],
  );

  const state = useSyncExternalStore(
    subscribe,
    () => getWorkspaceState(key, settings),
    () => getWorkspaceState(key, settings),
  );

  const update = useCallback(
    (updater: (previous: WorkspaceState) => WorkspaceState) =>
      updateWorkspaceState(key, settings, updater),
    [key, settings],
  );

  return { state, update };
}
