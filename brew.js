'use strict';

const core = require('@actions/core')

const { execSync } = require('./common')

// clean inputs
let brew = core.getInput('brew').replace(/[^a-z_ \d.@-]+/gi, '').trim().toLowerCase()

export const run = async () => {
  try {
    if (brew !== '') {
      if (brew.includes('_update_')) {
        execSync('brew update')
        brew = brew.replace(/_update_/gi, '').trim()
      }
      
      if (brew.includes('_upgrade_')) {
        execSync('brew update')
        execSync('brew upgrade')
        brew = brew.replace(/_upgrade_/gi, '').trim()
      }
      
      if (brew !== '') {
        execSync(`brew install ${brew}`)
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
