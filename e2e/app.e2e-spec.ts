import { HoheartedleePage } from './app.po';

describe('hoheartedlee App', () => {
  let page: HoheartedleePage;

  beforeEach(() => {
    page = new HoheartedleePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
