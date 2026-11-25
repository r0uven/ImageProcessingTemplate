import type { ReactNode } from "react";

import * as S from "./SettingsSection.styles";

type SettingsSectionProps = {
  sectionKey: string;
  title: string;
  fieldCount: number;
  isOpen: boolean;
  searching: boolean;
  storage?: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function SettingsSection({
  sectionKey,
  title,
  fieldCount,
  isOpen,
  searching,
  storage = false,
  onToggle,
  children,
}: SettingsSectionProps) {
  return (
    <S.SectionCard $open={isOpen}>
      <S.SectionHeaderButton
        type="button"
        aria-expanded={isOpen}
        onClick={() => {
          if (!searching) onToggle();
        }}
      >
        <S.SectionHeading>
          <S.SectionChevron $open={isOpen}>▸</S.SectionChevron>
          <S.SectionTitle>{title}</S.SectionTitle>
        </S.SectionHeading>

        <S.SectionMeta>
          <S.SectionCount>{fieldCount} парам.</S.SectionCount>
          <S.SectionKey>{sectionKey}</S.SectionKey>
        </S.SectionMeta>
      </S.SectionHeaderButton>

      {isOpen && (
        <S.SectionBody>
          {storage ? <S.StorageSection>{children}</S.StorageSection> : children}
        </S.SectionBody>
      )}
    </S.SectionCard>
  );
}
