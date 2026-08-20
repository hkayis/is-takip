import { Injectable, signal, computed, effect } from '@angular/core';
import { GRAFIKLER, SLOT_SAYISI } from '../grafikler';
export type Tema = 'acik' | 'koyu' | 'sistem';

export interface Ayarlar {
    buyuklukEsikleri: Record<string, number>;
    hedefSureler: Record<string, number>;
    dikkatPenceresiGun: number;
    tamamlananGun: number;
    tema: Tema;
    panoSlotlari: string[];
}

const VARSAYILAN: Ayarlar = {
    buyuklukEsikleri: { FastTrack: 5, XS: 10, S: 25, M: 50, L: 100, XL: 300 },
    hedefSureler: { FastTrack: 10, XS: 20, S: 40, M: 70, L: 120, XL: 200 },
    dikkatPenceresiGun: 7,
    tamamlananGun: 14,
    tema: 'sistem',
    panoSlotlari: ['dikkat', 'oncelik', 'buyukluk', 'asama'],
};
@Injectable({ providedIn: 'root' })
export class AyarService {

    private readonly ANAHTAR = 'is-akisi-ayarlar';

    private _ayarlar = signal<Ayarlar>(this.oku());
    ayarlar = this._ayarlar.asReadonly();

    buyuklukEsikleri = computed(() =>
        this._ayarlar().buyuklukEsikleri);

    hedefSureler = computed(() =>
        this._ayarlar().hedefSureler);

    dikkatPenceresiGun = computed(() =>
        this._ayarlar().dikkatPenceresiGun);

    tamamlananGun = computed(() =>
        this._ayarlar().tamamlananGun);
    tema = computed(() => this._ayarlar().tema);

    panoSlotlari = computed(() => this._ayarlar().panoSlotlari);
    constructor() {
        effect(() => {
            const t = this._ayarlar().tema;
            document.documentElement.style.colorScheme =
                t === 'koyu' ? 'dark' : t === 'acik' ? 'light' : 'light dark';

        });
    }
        kaydet(yeni: Partial<Ayarlar>) {
        const guncel = { ...this._ayarlar(), ...yeni };
        this._ayarlar.set(guncel);
        localStorage.setItem(this.ANAHTAR, JSON.stringify(guncel));
    }

    sifirla(){
        this.kaydet(VARSAYILAN);
    }

    private oku() : Ayarlar{
        const ham = localStorage.getItem(this.ANAHTAR);
        if(!ham) return VARSAYILAN;
        try{
            const okunan: Ayarlar = {...VARSAYILAN, ...JSON.parse(ham)};
            return {...okunan, panoSlotlari: this.slotlariDogrula(okunan.panoSlotlari)};
        } catch{
            return VARSAYILAN;
        }
    }

    private slotlariDogrula(slotlar: unknown): string[] {
        if (!Array.isArray(slotlar)) return VARSAYILAN.panoSlotlari;

        const gecerli = slotlar.filter(
          (id): id is string => GRAFIKLER.some(g => g.id === id)
        );
        const benzersiz = [...new Set(gecerli)];

        return benzersiz.length === SLOT_SAYISI ? benzersiz : VARSAYILAN.panoSlotlari;
    }

}
