#!/usr/bin/env node

import prompts from 'prompts'
import { red, green } from 'kolorist'
import 'zx/globals'

import frames from './constants'
import { canSkipEmptying, emptyDir } from './utils'

const framesTypes = frames.map((item) => item.type)
const getFramesListByIndex = (index) => frames[index]?.list

async function init() {
  const defaultProjectName = 'vite-project'

  let result: {
    projectName?: string
    shouldOverwrite?: boolean
    frame?: string
    link?: string
  } = {}

  let frameIndex
  let targetDir

  try {
    result = await prompts([
      {
        name: 'projectName',
        type: 'text',
        message: 'Project name:',
        initial: defaultProjectName,
        onState: (state) => (targetDir = String(state.value).trim()) || defaultProjectName
      },
      {
        name: 'shouldOverwrite',
        type: () => (canSkipEmptying(targetDir) ? null : 'confirm'),
        message: () => {
          const dirForPrompt =
            targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`

          return `${dirForPrompt} is not empty. Remove existing files and continue?`
        },
        initial: true
      },
      {
        name: 'frame',
        type: 'select',
        message: 'Pick a frame',
        choices: framesTypes,
        onState: (state) => (frameIndex = state.value)
      },
      {
        name: 'link',
        type: 'select',
        message: 'Select a template',
        choices: () => getFramesListByIndex(frameIndex)
      }
    ])
  } catch (cancelled) {
    console.log(cancelled.message)
    process.exit(1)
  }

  const { projectName, shouldOverwrite, link } = result

  if (!projectName || !link) {
    console.error(red('unexpected out'))
    process.exit(1)
  }

  if (!canSkipEmptying(targetDir)) {
    if (shouldOverwrite) {
      emptyDir(projectName)
    } else {
      console.error(red('Target directory is not empty. Remove existing files and continue'))
      process.exit(1)
    }
  }

  try {
    await $`git clone --depth=1 ${link}.git ${projectName}`
    await $`rm -rf ./${projectName}/.git`
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  console.log(green('finish'))
  process.exit(0)
}

init().catch((e) => {
  console.error(e)
})
