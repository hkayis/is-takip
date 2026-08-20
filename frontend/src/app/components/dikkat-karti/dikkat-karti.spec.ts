import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DikkatKarti } from './dikkat-karti';

describe('DikkatKarti', () => {
  let component: DikkatKarti;
  let fixture: ComponentFixture<DikkatKarti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DikkatKarti],
    }).compileComponents();

    fixture = TestBed.createComponent(DikkatKarti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
