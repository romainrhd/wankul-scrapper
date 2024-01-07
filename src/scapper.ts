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
    () => Array.from(
      document.querySelectorAll('.rank__result-cell'),
      element => {
        const infoElement: Maybe<HTMLElement> = element.querySelector('.rank__result-cell-infos');
        const nameElement: Maybe<HTMLElement> | undefined = infoElement?.querySelector('.rank__result-name');
        const posElement: Maybe<HTMLElement> | undefined = infoElement?.querySelector('.rank__result-pos');
        const imgElement: Maybe<HTMLImageElement> = element.querySelector('.rank__result-img');

        let id: number | undefined;
        let name: string | undefined;
        let image: string | undefined;

        if(nameElement?.innerText.includes("#")) {
          id = Number(nameElement.innerText.split("#")[1]);
        }

        if(posElement) {
          name = posElement.innerText.charAt(0).toUpperCase()
            + posElement.innerText.slice(1).toLowerCase();
        }

        if(imgElement) {
          image = imgElement.src;
        }

        return { id, name, image }
      }
    )
  );

  await browser.close();

  return cards;
};