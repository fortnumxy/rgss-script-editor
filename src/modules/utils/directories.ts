import * as fs from 'fs';
import * as pathResolve from './path_resolve';

/**
 * Base options.
 */
export type Options = {
  /**
   * Recursive flag.
   */
  recursive?: boolean;
};

/**
 * Read options.
 */
export type ReadOptions = {
  /**
   * Relative flag.
   *
   * Formats all entries to be relative of the given directory.
   */
  relative?: boolean;
} & Options;

/**
 * Write options.
 */
export type WriteOptions = {
  /**
   * Overwrite flag.
   */
  overwrite?: boolean;
} & Options;

/**
 * Creates a folder in the given path.
 *
 * This function may throw errors.
 * @param folderPath Path to the folder.
 * @param options Options.
 */
export function createFolder(folderPath: string, options?: WriteOptions) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: options?.recursive });
  }
}
/**
 * Copies the file located in ``source`` to ``destination``.
 *
 * If the file already exists it throws an error if ``overwrite`` flag is disabled.
 *
 * If ``recursive`` flag is enabled it will create the destination directory if it does not exists.
 * @param source Source file path
 * @param destination Destination file path
 * @param options Options.
 */
export function copyFile(
  source: string,
  destination: string,
  options?: WriteOptions
) {
  let destinationPath = pathResolve.dirname(destination);
  // Create directory if possible
  if (!fs.existsSync(destinationPath) && options?.recursive) {
    createFolder(destinationPath, options);
  }
  // Copy file
  fs.copyFileSync(
    source,
    destination,
    options?.overwrite ? undefined : fs.constants.COPYFILE_EXCL
  );
}

/**
 * Reads all entries of the given directory specified by ``base``.
 *
 * Optionally, some options ({@link ReadOptions ``ReadOptions``}) can be given that changes the behavior of this function.
 *
 * A callback function can be given to handle the entries before returning them.
 *
 * If the given directory does not exists it raises an exception.
 * @param base Base directory
 * @param options Read options
 * @param filter Filter callback
 * @returns List of entries
 */
export function readDirectory(
  base: string,
  options?: ReadOptions,
  filter?: (entries: string[]) => string[]
): string[] {
  // Gets data (absolute paths)
  let entries = readDir(base, options?.recursive);
  // Process relative flag
  if (options?.relative) {
    entries = entries.map((entry) => {
      return pathResolve.relative(base, entry);
    });
  }
  // Returns data
  return filter ? filter(entries) : entries;
}

/**
 * Reads the given directory.
 *
 * If the recursive flag is activated it will read all subfolders of the directory.
 * @param base Base directory
 * @param recursive Recursive flag
 * @returns List of entries
 */
function readDir(base: string, recursive?: boolean) {
  let entries: string[] = [];
  fs.readdirSync(base).forEach((entry) => {
    let fullPath = pathResolve.join(base, entry);
    // Inserts entry
    entries.push(fullPath);
    // Process recursiveness
    if (fs.statSync(fullPath).isDirectory() && recursive) {
      entries = entries.concat(...readDir(fullPath, recursive));
    }
  });
  return entries;
}
