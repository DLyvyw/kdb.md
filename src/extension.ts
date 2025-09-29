import * as vscode from "vscode";

import { TodoDocumentSymbolProvider } from "./SymbolProvider";
import { getCWFromDate, getDateWeek } from "./DateUtils";
import { updateTodoDecorations } from "./TodoDecorations";
import { TodoItem } from "./TodoItem";
import { match } from "assert";

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("decorator sample is activated");

  let timeout: NodeJS.Timeout | undefined = undefined;

  let activeEditor = vscode.window.activeTextEditor;

  function updateDecorations(): void {
    if (!activeEditor) {
      return;
    }
    updateTodoDecorations(activeEditor);
  }

  function triggerUpdateDecorations(throttle = false) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (throttle) {
      timeout = setTimeout(updateDecorations, 500);
    } else {
      updateDecorations();
    }
  }

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
      myStatusBarItem.show();
      myStatusBarItem.show();
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
      }
    },
    null,
    context.subscriptions
  );

  vscode.languages.registerDocumentSymbolProvider(
    { scheme: "file", language: "markdown" },
    new TodoDocumentSymbolProvider()
  );

  // register a command that is invoked when the status bar
  // item is selected
  const onCWStatusBarClick = "kdbTodo.onCWStatusBarClick";
  vscode.commands.registerCommand(onCWStatusBarClick, () => {
    /* {
      query: string,
      includes: string,
      excludes: string,
      contextLines: number,
      wholeWord: boolean,
      caseSensitive: boolean,
      regexp: boolean,
      useIgnores: boolean,
      showIncludesExcludes: boolean,
    } */
    vscode.commands.executeCommand("search.action.openEditor", {
      query: TodoItem.RegEx.source,
      includes: "*.md",
      regexp: true,
      triggerSearch: true,
    });
  });

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "kdbTodo.onKeyPressEnter",
      (textEditor, edit) => {
        if (textEditor) {
          const currentLine = textEditor.document.lineAt(
            textEditor.selection.active.line
          ).text;
          const regEx = /(^\s*(?:(\*|-|\d+|>)\.? )?)(.*)?/;
          const matchLine = regEx.exec(currentLine);
          if (matchLine && matchLine[1]) {
            if (matchLine[3]) {
              let newListLine = matchLine[1];
              const numOrNan = parseInt(matchLine[2]);
              if (!isNaN(numOrNan)) {
                newListLine = newListLine.replace(
                  matchLine[2],
                  String(numOrNan + 1)
                );
              }
              const todoRegex = TodoItem.RegEx;
              const matchTodo = todoRegex.exec(matchLine[3]);
              if (matchTodo) {
                const todoItem = new TodoItem(matchTodo);
                if (todoItem.text.trim() === "") {
                  edit.delete(
                    new vscode.Range(
                      new vscode.Position(textEditor.selection.active.line, 0),
                      textEditor.selection.active
                    )
                  );
                } else {
                  edit.insert(
                    textEditor.selection.active,
                    "\n" + newListLine + todoItem.todoPrefix + " "
                  );
                }
              } else {
                edit.insert(textEditor.selection.active, "\n" + newListLine);
              }
            } else {
              edit.delete(
                new vscode.Range(
                  new vscode.Position(textEditor.selection.active.line, 0),
                  textEditor.selection.active
                )
              );
            }
          } else {
            edit.insert(textEditor.selection.active, "\n");
          }
        }
      }
    )
  );

  // create a new status bar item that we can now manage
  const myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  const weekNumber = getCWFromDate(new Date());
  myStatusBarItem.command = onCWStatusBarClick;
  myStatusBarItem.text = `${weekNumber}`;
  myStatusBarItem.color = "red";
  myStatusBarItem.show();
}
