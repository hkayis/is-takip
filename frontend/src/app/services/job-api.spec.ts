import { TestBed } from '@angular/core/testing';

import { JobApi } from './job-api';

describe('JobApi', () => {
  let service: JobApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
