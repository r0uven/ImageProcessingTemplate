import { useEffect, useMemo, useRef, useState } from "react";

import { SECTION_LABELS } from "@/entities/settings";
import {
  getSearchTokens,
  isObject,
  ObjectFields,
  objectHasSearchMatch,
  SECTION_ORDER,
  sectionScope,
  SettingsSection,
  withoutStorageRegistry,
} from "@/features/settings-editor";
import { StorageManager } from "@/features/storage-manager";
import { Page, PageContent, PageHeader, PageTitleBlock } from "@/shared/ui/page";
import { PageSubtitle, PageTitle } from "@/shared/ui/typography";

import { useSettingsDraft } from "../model/useSettingsDraft";
import { SettingsActionBar } from "./SettingsActionBar";
import { SettingsMetaCard } from "./SettingsMetaCard";
import { SettingsToolbar } from "./SettingsToolbar";
import * as S from "./SettingsPage.styles";

export const SettingsPage = () => {
  const {
    draft,
    meta,
    saving,
    message,
    error,
    dirty,
    updateSection,
    reset,
    handleSave,
    handleStorageChanged,
  } = useSettingsDraft();

  const [query, setQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["storage"]),
  );
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;

      // Панель прилипла, когда её верхняя граница дошла до top: 24px.
      // В этот момент сдвигаем её вправо от кнопки «Назад».
      const stuck = toolbar.getBoundingClientRect().top <= 25;
      toolbar.dataset.stuck = String(stuck);
    };

    // Первый кадр нужен для восстановленной прокрутки и возврата на страницу.
    const frame = requestAnimationFrame(update);

    // capture ловит прокрутку любого контейнера, а не только window.
    document.addEventListener("scroll", update, true);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("pageshow", update);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", update, true);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pageshow", update);
    };
  }, []);

  const sections = useMemo(() => {
    if (!isObject(draft)) return [];

    const keys = Object.keys(draft);
    const ordered = SECTION_ORDER.filter((key) => keys.includes(key));
    const rest = keys.filter((key) => !SECTION_ORDER.includes(key));

    return [...ordered, ...rest];
  }, [draft]);

  const searchTokens = useMemo(() => getSearchTokens(query), [query]);
  const searching = searchTokens.length > 0;

  const visibleSections = useMemo(() => {
    if (!isObject(draft) || !searchTokens.length) return sections;

    return sections.filter((section) => {
      const value = draft[section];

      if (!isObject(value)) return false;

      const scope = sectionScope(section);

      // Запрос совпал с названием группы — показываем её целиком.
      if (searchTokens.every((token) => scope.includes(token))) return true;

      return objectHasSearchMatch(value, section, scope, searchTokens);
    });
  }, [draft, searchTokens, sections]);

  const toggleSection = (section: string) => {
    setExpandedSections((previous) => {
      const next = new Set(previous);

      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }

      return next;
    });
  };

  return (
    <Page>
      <PageContent $maxWidth="1200px" $padding="72px 48px 140px">
        <PageHeader>
          <PageTitleBlock>
            <PageTitle>Глобальные настройки</PageTitle>

            <PageSubtitle>
              Все параметры обработки, хранения и обучения берутся из
              settings.json. Изменения сохраняются в файл и применяются без
              перезапуска backend.
            </PageSubtitle>
          </PageTitleBlock>
        </PageHeader>

        <SettingsToolbar
          toolbarRef={toolbarRef}
          query={query}
          onQueryChange={setQuery}
          onExpandAll={() => setExpandedSections(new Set(sections))}
          onCollapseAll={() => setExpandedSections(new Set())}
        />

        <SettingsMetaCard meta={meta} />

        {message && <S.PageMessage>{message}</S.PageMessage>}
        {error && <S.PageMessage $variant="error">{error}</S.PageMessage>}

        {searching && (
          <S.SearchHint>
            Найдено разделов: {visibleSections.length}
            {visibleSections.length > 0
              ? ". Подходящие разделы раскрыты автоматически."
              : ". Попробуйте изменить запрос."}
          </S.SearchHint>
        )}

        {searching && visibleSections.length === 0 && (
          <S.EmptyState>По запросу «{query}» ничего не найдено.</S.EmptyState>
        )}

        {visibleSections.map((section) => {
          const value = isObject(draft) ? draft[section] : null;

          if (!isObject(value)) return null;

          const scope = sectionScope(section);
          const sectionMatchesQuery =
            searching && searchTokens.every((token) => scope.includes(token));
          const filterTokens =
            searching && !sectionMatchesQuery ? searchTokens : [];
          const isOpen = searching || expandedSections.has(section);

          return (
            <SettingsSection
              key={section}
              sectionKey={section}
              title={SECTION_LABELS[section] ?? section}
              fieldCount={Object.keys(value).length}
              isOpen={isOpen}
              searching={searching}
              storage={section === "storage"}
              onToggle={() => toggleSection(section)}
            >
              {section === "storage" ? (
                <>
                  <StorageManager onChanged={handleStorageChanged} />

                  <ObjectFields
                    value={withoutStorageRegistry(value)}
                    path={section}
                    scope={scope}
                    tokens={filterTokens}
                    onChange={(next) =>
                      updateSection(section, {
                        ...value,
                        ...next,
                        storages: value.storages,
                        active_storage_id: value.active_storage_id,
                      })
                    }
                  />
                </>
              ) : (
                <ObjectFields
                  value={value}
                  path={section}
                  scope={scope}
                  tokens={filterTokens}
                  onChange={(next) => updateSection(section, next)}
                />
              )}
            </SettingsSection>
          );
        })}
      </PageContent>

      <SettingsActionBar
        saving={saving}
        error={error}
        dirty={dirty}
        onReset={reset}
        onSave={() => void handleSave()}
      />
    </Page>
  );
};
