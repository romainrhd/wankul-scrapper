import slugify from "slugify";
import { Choice } from "./types";
import {scrapper} from "./scapper";
import select from "@inquirer/select";

async function main(): Promise<void> {
  try {
    const SEASONS: Array<string> = ['Saison 1', 'Saison 2', 'Hors série'];
    const choices: Array<Choice> = SEASONS.map(season => ({ name: season, value: season }));
    const answer: string = await select({
      message: 'Quelle extension voules-vous récupérer ?',
      choices
    });

    await scrapper(slugify(answer, {lower: true}));
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();