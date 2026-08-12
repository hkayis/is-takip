import { TestBed } from '@angular/core/testing';

import { Ayar } from './ayar';

describe('Ayar', () => {
  let service: Ayar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ayar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
