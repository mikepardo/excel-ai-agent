import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormulaEngine, SheetData } from '@/lib/formulaEngine';
import { DataEntryAssistant, Suggestion } from '@/lib/dataEntryAssistant';
import { Calculator, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

interface InteractiveSpreadsheetProps {
  initialData?: any[][];
  rows?: number;
  cols?: number;
}

export function InteractiveSpreadsheet({
  initialData,
  rows = 20,
  cols = 10,
}: InteractiveSpreadsheetProps) {
  const [data, setData] = useState<any[][]>(() => {
    if (initialData) return initialData;
    return Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(''));
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [formulaBar, setFormulaBar] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);

  const formulaEngine = useRef(new FormulaEngine());
  const dataAssistant = useRef(new DataEntryAssistant());
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize formula engine and data assistant
  useEffect(() => {
    // Convert data to SheetData format
    const sheetData: SheetData = {};
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== '' && cell !== null) {
          const cellAddress = getCellAddress(rowIndex, colIndex);
          if (typeof cell === 'string' && cell.startsWith('=')) {
            sheetData[cellAddress] = { value: null, formula: cell.substring(1) };
          } else {
            sheetData[cellAddress] = { value: cell };
          }
        }
      });
    });

    formulaEngine.current = new FormulaEngine(sheetData);
    formulaEngine.current.recalculate();

    // Analyze data for assistant
    dataAssistant.current.analyzeData(data);

    // Update data with calculated values
    updateDataFromEngine();
  }, []);

  const getCellAddress = (row: number, col: number): string => {
    const colName = String.fromCharCode(65 + col);
    return `${colName}${row + 1}`;
  };

  const updateDataFromEngine = () => {
    const allCells = formulaEngine.current.getAllCells();
    const newData = [...data];

    Object.entries(allCells).forEach(([address, cellData]) => {
      const parsed = FormulaEngine.parseCellAddress(address);
      if (parsed) {
        newData[parsed.row][parsed.col] = cellData.value;
      }
    });

    setData(newData);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    const cellAddress = getCellAddress(row, col);
    const formula = formulaEngine.current.getCellFormula(cellAddress);
    setFormulaBar(formula ? `=${formula}` : String(data[row][col] || ''));
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col });
    const cellAddress = getCellAddress(row, col);
    const formula = formulaEngine.current.getCellFormula(cellAddress);
    setEditValue(formula ? `=${formula}` : String(data[row][col] || ''));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputChange = (value: string) => {
    setEditValue(value);
    setFormulaBar(value);

    // Get suggestions if not a formula
    if (editingCell && !value.startsWith('=')) {
      const sug = dataAssistant.current.getSuggestions(
        editingCell.row,
        editingCell.col,
        value,
        data[editingCell.row],
        data
      );
      setSuggestions(sug);
      setSelectedSuggestion(0);
    } else {
      setSuggestions([]);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!editingCell) return;

    if (e.key === 'Enter') {
      if (suggestions.length > 0 && !editValue.startsWith('=')) {
        // Accept selected suggestion
        acceptSuggestion(suggestions[selectedSuggestion]);
      } else {
        commitCellValue();
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      cancelEdit();
      e.preventDefault();
    } else if (e.key === 'Tab') {
      if (suggestions.length > 0) {
        acceptSuggestion(suggestions[selectedSuggestion]);
        e.preventDefault();
      } else {
        commitCellValue();
        // Move to next cell
        if (editingCell.col < cols - 1) {
          handleCellDoubleClick(editingCell.row, editingCell.col + 1);
        }
        e.preventDefault();
      }
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      e.preventDefault();
    }
  };

  const acceptSuggestion = (suggestion: Suggestion) => {
    if (!editingCell) return;

    setEditValue(String(suggestion.value));
    setSuggestions([]);
    
    // Commit the suggested value
    setTimeout(() => {
      commitCellValue(String(suggestion.value));
    }, 0);
  };

  const commitCellValue = (value?: string) => {
    if (!editingCell) return;

    const finalValue = value || editValue;
    const { row, col } = editingCell;
    const cellAddress = getCellAddress(row, col);

    if (finalValue.startsWith('=')) {
      // It's a formula
      formulaEngine.current.setCellFormula(cellAddress, finalValue.substring(1));
      toast.success(`Formula set in ${cellAddress}`);
    } else {
      // Regular value
      formulaEngine.current.setCellValue(cellAddress, finalValue);
      
      // Learn from this entry
      const oldValue = data[row][col];
      if (oldValue !== finalValue) {
        dataAssistant.current.learnFromCorrection(col, oldValue, finalValue);
      }
    }

    updateDataFromEngine();
    setEditingCell(null);
    setEditValue('');
    setSuggestions([]);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
    setSuggestions([]);
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBar(value);
    if (editingCell) {
      setEditValue(value);
    }
  };

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedCell) {
      const { row, col } = selectedCell;
      const cellAddress = getCellAddress(row, col);

      if (formulaBar.startsWith('=')) {
        formulaEngine.current.setCellFormula(cellAddress, formulaBar.substring(1));
      } else {
        formulaEngine.current.setCellValue(cellAddress, formulaBar);
      }

      updateDataFromEngine();
      toast.success(`Updated ${cellAddress}`);
    }
  };

  const getColumnHeader = (col: number): string => {
    return String.fromCharCode(65 + col);
  };

  return (
    <div className="space-y-4">
      {/* Formula Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-gray-600" />
          <div className="flex items-center gap-2 flex-1">
            <Badge variant="outline">
              {selectedCell ? getCellAddress(selectedCell.row, selectedCell.col) : 'No cell selected'}
            </Badge>
            <Input
              value={formulaBar}
              onChange={(e) => handleFormulaBarChange(e.target.value)}
              onKeyDown={handleFormulaBarKeyDown}
              placeholder="Enter value or formula (start with =)"
              className="flex-1"
            />
          </div>
        </div>
      </Card>

      {/* Spreadsheet Grid */}
      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border bg-gray-100 p-2 w-12 text-xs font-semibold sticky left-0 z-10"></th>
              {Array.from({ length: cols }).map((_, col) => (
                <th key={col} className="border bg-gray-100 p-2 min-w-[100px] text-xs font-semibold">
                  {getColumnHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border bg-gray-100 p-2 text-center text-xs font-semibold sticky left-0 z-10">
                  {rowIndex + 1}
                </td>
                {row.map((cell, colIndex) => {
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  const cellAddress = getCellAddress(rowIndex, colIndex);
                  const hasFormula = formulaEngine.current.getCellFormula(cellAddress);

                  return (
                    <td
                      key={colIndex}
                      className={`border p-0 relative ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      } ${hasFormula ? 'bg-green-50' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            onBlur={() => commitCellValue()}
                            className="border-0 rounded-none h-8 text-sm"
                          />
                          {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border shadow-lg z-20 max-h-48 overflow-y-auto">
                              {suggestions.map((sug, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2 cursor-pointer hover:bg-blue-50 ${
                                    idx === selectedSuggestion ? 'bg-blue-100' : ''
                                  }`}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    acceptSuggestion(sug);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{sug.value}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {Math.round(sug.confidence * 100)}%
                                      </Badge>
                                      {idx === selectedSuggestion && (
                                        <Check className="h-3 w-3 text-blue-600" />
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{sug.reason}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2 min-h-[32px] text-sm flex items-center justify-between">
                          <span>{cell}</span>
                          {hasFormula && (
                            <Sparkles className="h-3 w-3 text-green-600 flex-shrink-0 ml-1" />
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>• Double-click a cell to edit • Start with = for formulas • Press Tab to accept suggestions</p>
        <p>• Formulas: =SUM(A1:A10), =AVERAGE(B1:B5), =IF(A1&gt;10,&quot;Yes&quot;,&quot;No&quot;), =VLOOKUP(A2,B:D,3,FALSE)</p>
      </div>
    </div>
  );
}
