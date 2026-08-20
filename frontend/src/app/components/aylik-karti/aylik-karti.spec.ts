import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AylikKarti } from './aylik-karti';

describe('AylikKarti', () => {
  let component: AylikKarti;
  let fixture: ComponentFixture<AylikKarti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AylikKarti],
    }).compileComponents();

    fixture = TestBed.createComponent(AylikKarti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
