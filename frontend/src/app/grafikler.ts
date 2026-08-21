export interface GrafikTanimi {
    id: string;
    baslik: string;
}

export const GRAFIKLER: GrafikTanimi[] = [
    { id: 'dikkat', baslik: 'Dikkat Gerekenler' },
    { id: 'oncelik', baslik: 'Öncelik Dağılımı' },
    { id: 'buyukluk', baslik: 'Büyüklük Dağılımı' },
    { id: 'asama', baslik: 'Aşama Dağılımı' },
    { id: 'teslim', baslik: 'Teslim Performansı' },
    { id: 'aylik', baslik: 'Aylık Tamamlanan' },
    { id: 'tahmin', baslik: 'Tahmin vs Gerçekleşen' },
];

export const SLOT_SAYISI = 4;

export function grafikAdi(id: string): string {
    return GRAFIKLER.find(g => g.id === id)?.baslik ?? id;
}