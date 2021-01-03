#!/usr/bin/env ts-node-script
import * as childProcess from "child_process"
import * as envVars from "./env-vars"
import * as util from "util"

const exec = util.promisify(childProcess.exec)
const { escapePath } = envVars

export async function command() {
  // Assume ths is run via a `npm run` context and we get PATH modifications.
  const { stdout, stderr } = await exec(
    `asar extract ${escapePath(envVars.DIR_WAYWARD_ASAR)} ${escapePath(
      envVars.DIR_RESOURCES_EXTRACTED
    )}`
  )
  if (stdout) {
    console.log(stdout)
  }
  if (stderr) {
    console.error(stderr)
  }
}

if (require.main === module) {
  command()
}
