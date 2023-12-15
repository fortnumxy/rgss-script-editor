import * as vscode from 'vscode';
import { EditorSectionBase } from '../../processes/scripts_controller';

/**
 * A data provider that provides tree data.
 */
export class EditorViewProvider
  implements vscode.TreeDataProvider<EditorSectionBase>
{
  /**
   * Scripts folder data.
   */
  private _root: EditorSectionBase | undefined;

  /**
   * On did change tree data event emitter.
   */
  private _onDidChangeTreeData: vscode.EventEmitter<
    EditorSectionBase | undefined | null | void
  > = new vscode.EventEmitter<EditorSectionBase | undefined | null | void>();

  /**
   * On did change tree data event.
   */
  readonly onDidChangeTreeData: vscode.Event<
    EditorSectionBase | undefined | null | void
  > = this._onDidChangeTreeData.event;

  /**
   * Constructor.
   * @param root Tree root
   */
  constructor(root?: EditorSectionBase) {
    this._root = root;
  }

  /**
   * This method signals that an element or root has changed in the tree.
   *
   * This will trigger the view to update the changed element/root and its children recursively (if shown).
   *
   * To signal that root has changed, do not pass any argument or pass undefined or null.
   * @param element Script Section
   */
  refresh(element?: EditorSectionBase): void {
    this._onDidChangeTreeData.fire(element);
  }

  /**
   * Updates the provider script section root instance.
   * @param root Script section root
   */
  update(root: EditorSectionBase | undefined) {
    this._root = root;
  }

  /**
   * Reveals the appropiate script section on the tree view based on ``path``.
   * @param path Script section path
   */
  findTreeItem(path: vscode.Uri) {
    return this._root?.findChild(path, true);
  }

  /**
   * Returns the UI representation (TreeItem) of the element that gets displayed in the view.
   * @param element Element
   * @returns Tree item
   */
  getTreeItem(element: EditorSectionBase): vscode.TreeItem {
    return element;
  }

  /**
   * Gets a list of tree items by the given base script section.
   *
   * If ``element`` is nullish, it returns all children from the root.
   *
   * If ``element`` is a valid script section, it returns all of their children items.
   * @param element Base script section
   * @returns Returns the data
   */
  getChildren(element?: EditorSectionBase): Thenable<EditorSectionBase[]> {
    try {
      if (this._root) {
        let children = element ? element.children : this._root.children;
        return Promise.resolve(children);
      } else {
        return Promise.resolve([]);
      }
    } catch (error) {
      return Promise.resolve([]);
    }
  }

  /**
   * Gets the parent tree item (script section) of the given element.
   * @param element Script section
   * @returns Returns the element's parent
   */
  getParent(
    element: EditorSectionBase
  ): vscode.ProviderResult<EditorSectionBase> {
    return element.parent;
  }
}
