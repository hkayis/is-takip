import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeslimKarti } from './teslim-karti';

describe('TeslimKarti', () => {
  let component: TeslimKarti;
  let fixture: ComponentFixture<TeslimKarti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeslimKarti],
    }).compileComponents();

    fixture = TestBed.createComponent(TeslimKarti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
