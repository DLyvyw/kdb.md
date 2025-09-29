import * as vscode from "vscode";
import { TodoItem, TodoPriority } from "./TodoItem";

// create a decorator type that we use to decorate small numbers
const futureTaskDecorationType = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline dotted lightblue",
  overviewRulerColor: "lightblue",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: {
    // this color will be used in light color themes
    borderColor: "darkblue",
  },
  dark: {
    // this color will be used in dark color themes
    borderColor: "lightblue",
  },
});

const pastTaskDecorationType = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline dotted red",
  overviewRulerColor: "red",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: {
    // this color will be used in light color themes
    borderColor: "darkblue",
  },
  dark: {
    // this color will be used in dark color themes
    borderColor: "lightblue",
  },
});

const currentTaskDecorationType = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline dotted lightgreen",
  overviewRulerColor: "green",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
  light: {
    // this color will be used in light color themes
    borderColor: "darkblue",
  },
  dark: {
    // this color will be used in dark color themes
    borderColor: "lightblue",
  },
});

export function updateTodoDecorations(
  activeEditor: vscode.TextEditor | undefined
): void {
  if (!activeEditor) {
    return;
  }

  const regEx = TodoItem.RegEx;
  const text = activeEditor.document.getText();

  const todoDecorations: vscode.DecorationOptions[] = [];
  const pastDecorations: vscode.DecorationOptions[] = [];
  const futureDecorations: vscode.DecorationOptions[] = [];
  let match;
  while ((match = regEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const todoItem = new TodoItem(match);
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: `${todoItem.text}<${todoItem.details}>`,
    };
    if (todoItem.hasDeadline) {
      if (todoItem.daysDiff < 0) {
        pastDecorations.push(decoration);
      } else if (todoItem.daysDiff >= 7) {
        futureDecorations.push(decoration);
      } else {
        todoDecorations.push(decoration);
      }
    } else {
      if (
        todoItem.priority === TodoPriority.Critical ||
        todoItem.priority === TodoPriority.High
      ) {
        todoDecorations.push(decoration);
      } else {
        futureDecorations.push(decoration);
      }
    }
  }
  activeEditor.setDecorations(currentTaskDecorationType, todoDecorations);
  activeEditor.setDecorations(futureTaskDecorationType, futureDecorations);
  activeEditor.setDecorations(pastTaskDecorationType, pastDecorations);
}
