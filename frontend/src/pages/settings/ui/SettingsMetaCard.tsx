import type { SettingsEnvelope } from "@/entities/settings";

import * as S from "./SettingsPage.styles";

type SettingsMetaCardProps = {
  meta: SettingsEnvelope;
};

/** Служебная информация: путь к конфигу, папка изображений и хранилища. */
export function SettingsMetaCard({ meta }: SettingsMetaCardProps) {
  const activeStorage = meta.storages.find((entry) => entry.is_active);

  return (
    <S.MetaCard>
      <S.MetaRow>
        <span>Файл настроек:</span>
        <code>{meta.config_path}</code>
      </S.MetaRow>

      <S.MetaRow>
        <span>Папка изображений:</span>
        <code>{meta.resolved_images_directory}</code>
      </S.MetaRow>

      <S.MetaRow>
        <span>Хранилищ в реестре:</span>
        <code>
          {meta.storages.length}
          {activeStorage?.label ? ` · активно: ${activeStorage.label}` : ""}
        </code>
      </S.MetaRow>

      <S.MetaRow>
        <span>Путь в settings.json:</span>
        <code>{meta.images_directory}</code>
      </S.MetaRow>
    </S.MetaCard>
  );
}
