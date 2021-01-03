#!/usr/bin/env ts-node-script
import * as childProcess from "child_process"
import * as envVars from "./env-vars"
import * as util from "util"

const exec = util.promisify(childProcess.exec)
const { escapePath } = envVars

export async function command() {
  const modOutputPath = escapePath(
    `${envVars.DIR_WAYWARD_MODS_LOCAL}/${envVars.MOD_NAME}`
  )
  // Assume ths is run via a `npm run` context and we get PATH modifications.
  const { stdout, stderr } = await exec(
    `mkdirp ${modOutputPath} && rsync -av --progress --exclude wayward-mod-samples --exclude wayward-resources --exclude node_modules --exclude=".*" --exclude="package.json" --exclude="package-lock.json" ${escapePath(
      envVars.DIR_MOD
    )}/. ${modOutputPath}`
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
