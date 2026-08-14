import { TestBed } from '@angular/core/testing';

import { JobStore } from './job-store';

describe('JobStore', () => {
  let service: JobStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
