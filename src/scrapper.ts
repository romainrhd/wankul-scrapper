import {Browser, launch, Page} from "puppeteer";

export const scrapper = async (set: string) => {
  const browser: Browser = await launch({
    headless: true
  });
  const page: Page = await browser.newPage();

  await page.goto(`https://wankul.fr/pages/${set}`, {waitUntil: 'networkidle0'});

  let contentHeight: number = await page.evaluate(() => document.body.scrollHeight);
  let previousHeight: number = 0;

  while(contentHeight !== previousHeight) {
    previousHeight = contentHeight;
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(1000);
    contentHeight = await page.evaluate('document.body.scrollHeight') as number;
  }

  const cards: Array<Card> = await page.evaluate(
    () => {
      const elements = document.querySelectorAll('.rank__result-cell');

      const cardsArray = Array.from(elements, (element, index) => {
          const infoElement: Maybe<HTMLElement> = element.querySelector('.rank__result-cell-infos');
          const nameElement: Maybe<HTMLElement> | undefined = infoElement?.querySelector('.rank__result-name');
          const posElement: Maybe<HTMLElement> | undefined = infoElement?.querySelector('.rank__result-pos');
          const imgElement: Maybe<HTMLImageElement> | undefined = element.querySelector('.rank__result-img')?.querySelector('#imgIMG');

          let number: number | undefined;
          let name: string | undefined;
          let image: string | undefined;
          let land: boolean | undefined;

          if(nameElement?.innerText.includes("#")) {
            number = Number(nameElement.innerText.split("#")[1]);
          }

          if(posElement) {
            name = posElement.innerText.charAt(0).toUpperCase()
              + posElement.innerText.slice(1).toLowerCase();
          }

          if(imgElement) {
            image = imgElement.src;
          }

          if(element) {
            land = element.className.includes('Terrain');
          }

          return { number, name, image, land }
        }
      );

      return cardsArray;
    }
  );

  await browser.close();

  return cards;
};