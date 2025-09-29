import * as vscode from "vscode";
import { TodoItem, TodoPriority } from "./TodoItem";

export class TodoDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  public provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentSymbol[]> {
    return new Promise((resolve, reject) => {
      let symbols: vscode.DocumentSymbol[] = [];
      for (var i = 0; i < document.lineCount; i++) {
        var line = document.lineAt(i);
        const regEx = TodoItem.RegEx;
        let match;
        while ((match = regEx.exec(line.text))) {
          //            const startPos = document.positionAt(match.index);
          //            const endPos = document.positionAt(match.index + match[0].length);

          const todoItem = new TodoItem(match);
          let symbolKind;
          if (todoItem.hasDeadline) {
            if (todoItem.daysDiff < 0) {
              symbolKind = vscode.SymbolKind.Event;
            } else if (todoItem.daysDiff >= 7) {
              symbolKind = vscode.SymbolKind.Array;
            } else {
              symbolKind = vscode.SymbolKind.Constant;
            }
          } else {
            if (
              todoItem.priority === TodoPriority.Critical ||
              todoItem.priority === TodoPriority.High
            ) {
              symbolKind = vscode.SymbolKind.Event;
            } else {
              symbolKind = vscode.SymbolKind.Array;
            }
          }
          let symbol = new vscode.DocumentSymbol(
            todoItem.text,
            todoItem.details,
            symbolKind,
            line.range,
            line.range
          );
          symbols.push(symbol);
        }
      }
      resolve(symbols);
    });
  }
}
