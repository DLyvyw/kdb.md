import * as vscode from "vscode";

import { TodoDocumentSymbolProvider } from "./SymbolProvider";
import { getCWFromDate, getDateWeek } from "./DateUtils";
import { updateTodoDecorations } from "./TodoDecorations";
import { increaseTodoItemPriority, markTodoItemAsBlocked, markTodoItemAsDone, markTodoItemAsInProgress, TodoItem } from "./TodoItem";
import {
  markdownListInsertNewItem,
  markdownTodoUpdate,
} from "./TextEditorActions";
import { CodelensProvider } from "./CodeLenseProvider";
import { MarkDoneAction } from "./CodeActionProvider";

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
      todoStatusBarItem.show();
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


  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "kdbTodo.onKeyPressEnter",
      (textEditor, edit): void => {
        markdownListInsertNewItem(textEditor, edit);
      }
    )
  );

  vscode.commands.registerCommand("kdbTodo.markDone", () => {
    markdownTodoUpdate(markTodoItemAsDone);
  });
  vscode.commands.registerCommand("kdbTodo.markInProgress", () => {
    markdownTodoUpdate(markTodoItemAsInProgress);
  });
  vscode.commands.registerCommand("kdbTodo.markBlocked", () => {
    markdownTodoUpdate(markTodoItemAsBlocked);
  });
  vscode.commands.registerCommand("kdbTodo.postpone", () => {
    // TODO (add date?)
    markdownTodoUpdate(markTodoItemAsBlocked);
  });
  vscode.commands.registerCommand("kdbTodo.increasePriority", () => {
    markdownTodoUpdate(increaseTodoItemPriority);
  });

  const todoStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  todoStatusBarItem.command = "kdbTodo.todoStatusBarClick";
  todoStatusBarItem.text = `$(notebook-state-success) Todo`;
  todoStatusBarItem.show();

  vscode.commands.registerCommand("kdbTodo.todoStatusBarClick", () => {
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
  const journalStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );

  const weekNumber = getCWFromDate(new Date());
  journalStatusBarItem.command = "kdbTodo.journalStatusBarClick";
  journalStatusBarItem.text = `$(notebook-edit) ${weekNumber}`;
  journalStatusBarItem.show();

  vscode.commands.registerCommand("kdbTodo.journalStatusBarClick", () => {
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
      query: (/[📝💡📌🚩❓](<(((\/)?(\d+)\/(\d+))|(CW(\d+)\.(\d+)))>)?/gi).source,
      wholeWorld: true,
      contextLines: 2,
      includes: "*.md",
      regexp: true,
      triggerSearch: true,
    });
  });

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "markdown",
      new MarkDoneAction(),
      {
        providedCodeActionKinds: MarkDoneAction.providedCodeActionKinds,
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider("markdown", new CodelensProvider())
  );
}
