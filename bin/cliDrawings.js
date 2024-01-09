import _ from 'lodash';
import chalk from 'chalk';

const PAD_END_SIZE = 150;

export const drawQuestionHeader = (color, text) => {
  console.info();
  console.info(color.bold(_.padEnd('-', PAD_END_SIZE, '-')));
  console.info(color.bold(_.pad(text, PAD_END_SIZE)));
  console.info(color.bold(_.padEnd('-', PAD_END_SIZE, '-')));
  console.info();
};

export const drawInfo = (color, text) => {
  console.info();
  console.info(color.bold(_.padEnd(text, PAD_END_SIZE)));
};

export const drawError = (error) => {
  console.info();
  console.info(chalk.white.bgRed.bold(_.padEnd('!', PAD_END_SIZE, '!')));
  console.info(chalk.white.bgRed.bold(_.pad(error, PAD_END_SIZE)));
  console.info(chalk.white.bgRed.bold(_.padEnd('!', PAD_END_SIZE, '!')));
  console.info();
};
