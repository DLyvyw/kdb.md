import * as vscode from "vscode";
import { TodoItem, TodoPriority } from "./TodoItem";

// create a decorator type that we use to decorate small numbers
const blueTaskDecorationType = vscode.window.createTextEditorDecorationType({
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

const redTaskDecorationType = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline dotted red",
  overviewRulerColor: "red",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
});

const greenTaskDecorationType = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline dotted lightgreen",
  overviewRulerColor: "green",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
});

const orangeTaskDecorationType = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline dotted orange",
  overviewRulerColor: "orange",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
});

export function updateTodoDecorations(
  activeEditor: vscode.TextEditor | undefined
): void {
  if (!activeEditor) {
    return;
  }

  const regEx = TodoItem.RegEx;
  const text = activeEditor.document.getText();

  const greenTaskDecorations: vscode.DecorationOptions[] = [];
  const redTaskDecorations: vscode.DecorationOptions[] = [];
  const blueTaskDecorations: vscode.DecorationOptions[] = [];
  const orangeTaskDecorations: vscode.DecorationOptions[] = [];
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
        redTaskDecorations.push(decoration);
      } else if (todoItem.daysDiff >= 7) {
        blueTaskDecorations.push(decoration);
      } else {
        if (todoItem.isInProgress) {
          greenTaskDecorations.push(decoration);
        } else {
          orangeTaskDecorations.push(decoration);
        }
      }
    } else {
      if (todoItem.isInProgress) {
        if (
          todoItem.priority === TodoPriority.Critical ||
          todoItem.priority === TodoPriority.High
        ) {
          orangeTaskDecorations.push(decoration);
        } else {
          greenTaskDecorations.push(decoration);
        }
      } else {
        if (todoItem.isBlocked) {
          if (
            todoItem.priority === TodoPriority.Critical ||
            todoItem.priority === TodoPriority.High
          ) {
            redTaskDecorations.push(decoration);
          } else {
            orangeTaskDecorations.push(decoration);
          }
        } else {
          if (todoItem.priority === TodoPriority.Critical) {
            redTaskDecorations.push(decoration);
          } else if (todoItem.priority === TodoPriority.High) {
            orangeTaskDecorations.push(decoration);
          } else {
            blueTaskDecorations.push(decoration);
          }
        }
      }
    }
  }
  activeEditor.setDecorations(greenTaskDecorationType, greenTaskDecorations);
  activeEditor.setDecorations(blueTaskDecorationType, blueTaskDecorations);
  activeEditor.setDecorations(redTaskDecorationType, redTaskDecorations);
  activeEditor.setDecorations(orangeTaskDecorationType, orangeTaskDecorations);
}
