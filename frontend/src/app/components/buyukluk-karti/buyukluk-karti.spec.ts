import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyuklukKarti } from './buyukluk-karti';

describe('BuyuklukKarti', () => {
  let component: BuyuklukKarti;
  let fixture: ComponentFixture<BuyuklukKarti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyuklukKarti],
    }).compileComponents();

    fixture = TestBed.createComponent(BuyuklukKarti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
