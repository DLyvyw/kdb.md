import * as vscode from "vscode";
import { increaseTodoItemPriority, markTodoItemAsBlocked, markTodoItemAsDone, markTodoItemAsInProgress, TodoItem, TodoPriority } from "./TodoItem";

/**
 * Provides code actions for converting :) to a smiley emoji.
 */
export class MarkDoneAction implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] | undefined {
    let result = undefined;
    const start = range.start;
    const line = document.lineAt(start.line);

    let regEx = TodoItem.RegEx;
    let match = regEx.exec(line.text);

    if (!match) {
      return;
    }

    let todoItem = new TodoItem(match);

    if (range.isEmpty) {
      range = document.lineAt(range.start.line).range;
    }


    const markDoneFix = this.createMarkDoneFix(document, range);
    result = [markDoneFix];
    if (!todoItem.isInProgress) {
      const markInProgress = this.createMarkInProgressFix(document, range);
      result.push(markInProgress);
    }

    if (todoItem.isInProgress) {
      const markBlocked = this.createMarkBlockedFix(document, range);
      result.push(markBlocked);
    }

    if (!(todoItem.priority === TodoPriority.Critical)) {
      const increasePriority = this.createIncreasePriorityFix(document, range);
      result.push(increasePriority);
    }
    return result;

  }

  private createMarkDoneFix(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    let text = document.getText(range);
    const changedText = markTodoItemAsDone(text);
    const fix = new vscode.CodeAction(
      `Done`,
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      new vscode.Range(range.start, range.end),
      changedText
    );
    return fix;
  }
  private createMarkInProgressFix(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    let text = document.getText(range);
    const changedText = markTodoItemAsInProgress(text);
    const fix = new vscode.CodeAction(
      `In progress`,
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      new vscode.Range(range.start, range.end),
      changedText
    );
    return fix;
  }
  private createMarkBlockedFix(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    let text = document.getText(range);
    const changedText = markTodoItemAsBlocked(text);
    const fix = new vscode.CodeAction(
      `Blocked`,
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      new vscode.Range(range.start, range.end),
      changedText
    );
    return fix;
  }
  private createIncreasePriorityFix(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    let text = document.getText(range);
    const changedText =  increaseTodoItemPriority(text);
    const fix = new vscode.CodeAction(
      `Increse priority`,
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      new vscode.Range(range.start, range.end),
      changedText
    );
    return fix;
  }
}
