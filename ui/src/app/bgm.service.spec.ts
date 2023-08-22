import { TestBed } from '@angular/core/testing';

import { BgmService } from './bgm.service';

describe('BgmService', () => {
  let service: BgmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BgmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
