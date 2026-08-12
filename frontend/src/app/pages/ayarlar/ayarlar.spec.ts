import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ayarlar } from './ayarlar';

describe('Ayarlar', () => {
  let component: Ayarlar;
  let fixture: ComponentFixture<Ayarlar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ayarlar],
    }).compileComponents();

    fixture = TestBed.createComponent(Ayarlar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
