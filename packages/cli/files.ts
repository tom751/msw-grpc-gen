/**
 * Get a filename without the extension from a file path.
 * If the filename has dots in it, split and return the first element
 * e.g. /test/my.file.ts would return the string 'my'
 * @param filepath The file path to get the filename from
 * @returns the filename without the extension
 */
export function getFilename(filepath: string): string {
  const filename = filepath.split('/').pop()?.split('.').shift()

  if (!filename) {
    throw new Error(`Unable to get filename from path '${filepath}'`)
  }

  return filename
}
