import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TahminKarti } from './tahmin-karti';

describe('TahminKarti', () => {
  let component: TahminKarti;
  let fixture: ComponentFixture<TahminKarti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TahminKarti],
    }).compileComponents();

    fixture = TestBed.createComponent(TahminKarti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
