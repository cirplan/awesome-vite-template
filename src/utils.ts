import * as fs from 'node:fs'
import * as path from 'node:path'

export function canSkipEmptying(dir: string) {
  if (!fs.existsSync(dir)) {
    return true
  }

  return false
}

export function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file)
  )
}

export function postOrderDirectoryTraverse(dir, dirCallback, fileCallback) {
  for (const filename of fs.readdirSync(dir)) {
    const fullpath = path.resolve(dir, filename)
    if (fs.lstatSync(fullpath).isDirectory()) {
      postOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
      dirCallback(fullpath)
      continue
    }
    fileCallback(fullpath)
  }
}
