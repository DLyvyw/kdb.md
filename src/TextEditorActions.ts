import * as vscode from "vscode";
import { TodoItem } from "./TodoItem";

export function markdownTodoUpdate(cb: (text:string)=>string) {
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (selectedText) {
      const processedText = cb(selectedText);
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, processedText);
      });
    } else {
      const currentLine = editor.document.lineAt(
        editor.selection.active.line
      ).text;
      const processedText = cb(currentLine);
      editor.edit((editBuilder) => {
        editBuilder.replace(
          new vscode.Range(
            new vscode.Position(editor.selection.active.line, 0),
            new vscode.Position(editor.selection.active.line, currentLine.length),
          ),
          processedText
        );
      });
    }
  }
}

export function markdownListInsertNewItem(
  textEditor: vscode.TextEditor,
  edit: vscode.TextEditorEdit
) {
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
          newListLine = newListLine.replace(matchLine[2], String(numOrNan + 1));
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
