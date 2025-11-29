import { TestBed } from '@angular/core/testing';

import { StaticCourses } from './static-courses';

describe('StaticCourses', () => {
  let service: StaticCourses;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticCourses);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
