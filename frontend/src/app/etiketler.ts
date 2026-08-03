const DURUM_ADLARI: Record<string, string> = {
  Beklemede: 'Bekleyen',
  DevamEdiyor: 'Devam Ediyor',
  Tamamlandi: 'Tamamlandı',
  Iptal: 'İptal',
};

const ONCELIK_ADLARI: Record<string, string> = {
  Dusuk: 'Düşük',
  Normal: 'Normal',
  Yuksek: 'Yüksek',
  Acil: 'Acil',
};

const ONCELIK_PUANLARI: Record<string, number> = {
  Dusuk: 1,
  Normal: 2,
  Yuksek: 3,
  Acil: 4,
};

export function oncelikPuani(kod: string): number {
  return ONCELIK_PUANLARI[kod] ?? 0;
}

export function durumAdi(kod: string): string {
  return DURUM_ADLARI[kod] ?? kod;
}

export function oncelikAdi(kod: string): string {
  return ONCELIK_ADLARI[kod] ?? kod;
}
