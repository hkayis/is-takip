import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsamaKarti } from './asama-karti';

describe('AsamaKarti', () => {
  let component: AsamaKarti;
  let fixture: ComponentFixture<AsamaKarti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsamaKarti],
    }).compileComponents();

    fixture = TestBed.createComponent(AsamaKarti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
