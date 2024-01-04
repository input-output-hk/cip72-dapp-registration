import _ from 'lodash'
import chalk from 'chalk'

const PAD_END_SIZE = 150

export const drawQuestionHeader = (color, text) => {
  console.log()
  console.log(color.bold(_.padEnd('-', PAD_END_SIZE, '-')))
  console.log(color.bold(_.pad(text, PAD_END_SIZE)))
  console.log(color.bold(_.padEnd('-', PAD_END_SIZE, '-')))
  console.log()
}

export const drawInfo = (color, text) => {
  console.log()
  console.log(color.bold(_.padEnd(text, PAD_END_SIZE)))
}

export const drawError = (error) => {
  console.log()
  console.log(chalk.white.bgRed.bold(_.padEnd('!', PAD_END_SIZE, '!')))
  console.log(chalk.white.bgRed.bold(_.pad(error, PAD_END_SIZE)))
  console.log(chalk.white.bgRed.bold(_.padEnd('!', PAD_END_SIZE, '!')))
  console.log()
}
