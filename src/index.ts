import { Choice } from "./types";
import { scrapper } from "./scrapper";
import select from "@inquirer/select";
import dotenv from "dotenv";
import cliProgress from "cli-progress";
import colors from "ansi-colors";

async function main(): Promise<void> {
  dotenv.config();

  const progressBar = new cliProgress.SingleBar({
    format: 'Upload cards |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Cards uploaded',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  const wankulBuilderUrl: string | undefined = process.env.WANKUL_BUILDER_BASE_URL;
  if (!wankulBuilderUrl) {
    throw new Error('WANKUL_BUILDER_BASE_URL is not defined in the environment variables');
  }

  try {
    const choices: Array<Choice> = [
      {
        name: 'Origins',
        value: 'saison-1'
      },
      {
        name: 'Campus',
        value: 'saison-2'
      },
      {
        name: 'Hors série',
        value: 'hors-serie'
      },
    ];
    const answer: string = await select({
      message: 'What the extension you want to scrape ?',
      choices
    });

    const cards: Array<Card> = await scrapper(answer);

    progressBar.start(cards.length, 0);

    for (const card of cards) {
      const response = await fetch(`${wankulBuilderUrl}/card`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(card)
      });
      if (response.status !== 201) {
        const reponseMessage = await response.json();
        console.error('Create card failed', reponseMessage);
      }
      progressBar.increment();
    }

    progressBar.stop();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();