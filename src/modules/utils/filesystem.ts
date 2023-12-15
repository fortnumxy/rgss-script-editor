import * as path from 'path';
import * as fs from 'fs';

/**
 * Base options.
 */
export type Options = {
  /**
   * Recursive flag.
   */
  recursive?: boolean;

  /**
   * Flag option.
   */
  flag?: string;
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
 * Checks if the given folder path is a directory or not.
 * @param folder Folder path
 * @returns Whether path is a directory.
 */
export function isFolder(folder: string): boolean {
  // Checks if path exists.
  if (!fs.existsSync(folder)) {
    return false;
  }
  // Checks if file is a directory.
  return fs.statSync(folder).isDirectory();
}

/**
 * Checks if the given file path is a file or not.
 * @param file File path
 * @returns Whether path is a file.
 */
export function isFile(file: string): boolean {
  // Checks if path exists.
  if (!fs.existsSync(file)) {
    return false;
  }
  // Checks if file is a directory.
  return fs.statSync(file).isFile();
}

/**
 * Checks if the given file path is a Ruby script file or not.
 * @param file File path
 * @returns Whether path is a Ruby file.
 */
export function isRubyFile(file: string): boolean {
  // Checks if it is a file.
  if (!isFile(file)) {
    return false;
  }
  // Checks if file is a Ruby script.
  return path.extname(file).toLowerCase() === '.rb';
}

/**
 * Returns ``true`` if the entry path exists, ``false`` otherwise.
 * @param entry Entry path
 * @returns Whether entry exists or not.
 */
export function exists(entry: string | undefined | null) {
  if (!entry) {
    return false;
  }
  return fs.existsSync(entry);
}

/**
 * Creates a folder in the given path.
 * @param folderPath Path to the folder.
 * @param options Options.
 */
export function createFolder(folderPath: string, options?: WriteOptions) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: options?.recursive });
  }
}

/**
 * Deletes the item specified by the given ``item`` path.
 *
 * If the deletion is successful it returns ``true``, otherwise ``false``.
 * @param item Item path
 * @returns Deletion result.
 */
export function remove(item: string): boolean {
  if (isFile(item) || isFolder(item)) {
    fs.unlinkSync(item);
    return true;
  }
  return false;
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
  let destinationPath = path.dirname(destination);
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
 * Reads the text file specified by ``file`` and returns its contents.
 *
 * If ``file`` is not file or it does not exists it returns ``undefined``.
 *
 * If a ``process`` callback is given, it will called to process the contents and returns the results.
 * @param file File path.
 * @param process Process contents callback.
 * @returns Returns the file contents.
 */
export function readTextFile<T>(
  file: string,
  process?: (contents: string) => T
) {
  let fileContents = fs.readFileSync(file, { encoding: 'utf8' });
  return process ? process(fileContents) : fileContents;
}

/**
 * Writes a new text file specified by ``path``.
 *
 * The file is written with ``utf-8`` encoding by default.
 *
 * The ``recursive`` flag can be used to create all folders needed to write the file.
 * @param file File path.
 * @param contents File contents.
 * @param options Write options.
 */
export function writeTextFile(
  file: string,
  contents: string,
  options?: WriteOptions
) {
  // Creates folder first if it does not exist and recursiveness is enabled
  let dir = path.dirname(file);
  if (options?.recursive) {
    createFolder(dir, { recursive: true });
  }
  // Creates new file.
  fs.writeFileSync(file, contents, {
    encoding: 'utf8',
    flag: options?.flag,
  });
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
      return path.relative(base, entry);
    });
  }
  // Returns data
  return filter ? filter(entries) : entries;
}

/**
 * Reads the given directory.
 *
 * If ``recursive`` flag is enabled it will read all subfolders of the directory.
 * @param base Base directory
 * @param recursive Recursive flag
 * @returns List of entries
 */
function readDir(base: string, recursive?: boolean) {
  let entries: string[] = [];
  fs.readdirSync(base).forEach((entry) => {
    let fullPath = path.join(base, entry);
    // Inserts entry
    entries.push(fullPath);
    // Process recursiveness
    if (fs.statSync(fullPath).isDirectory() && recursive) {
      entries = entries.concat(...readDir(fullPath, recursive));
    }
  });
  return entries;
}
