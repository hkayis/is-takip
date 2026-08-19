import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsKart } from './is-kart';

describe('IsKart', () => {
  let component: IsKart;
  let fixture: ComponentFixture<IsKart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsKart],
    }).compileComponents();

    fixture = TestBed.createComponent(IsKart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
