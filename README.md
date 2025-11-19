# Excel AI Agent

An AI-powered Excel agent for spreadsheet automation, financial modeling, and data processing - inspired by [tryshortcut.ai](https://www.tryshortcut.ai).

## Features

### Core Functionality
- **AI-Powered Spreadsheet Automation** - Natural language commands to create formulas, clean data, and build financial models
- **Excel File Processing** - Upload and parse .xlsx, .xlsm, and .csv files
- **Real-Time Collaboration** - Socket.IO-powered live editing with user presence tracking and cursor synchronization
- **Checkpoint System** - Version control for spreadsheets with ability to revert to previous states

### Formula Engine
- **Excel-Native Formula Execution** - JavaScript-based formula parser supporting 20+ Excel functions
  - Mathematical: SUM, AVERAGE, COUNT, MIN, MAX
  - Logical: IF, AND, OR, NOT
  - Lookup: VLOOKUP, HLOOKUP, INDEX, MATCH
  - Date/Time: DATE, TODAY, NOW, DATEDIF
  - Text: CONCATENATE, LEFT, RIGHT, MID, LEN
- **Real-Time Calculation** - Automatic dependency tracking and topological sort
- **Cell References** - Support for A1, $A$1, and Sheet1!A1 notation
- **Error Handling** - Proper #DIV/0!, #VALUE!, #REF! error messages

### AI Data Entry Assistant
- **Smart Autocomplete** - Pattern detection from existing data with confidence scoring
- **Data Type Recognition** - Automatic detection of numbers, dates, emails, phone numbers, currency, percentages
- **Relationship Analysis** - Detects correlations between columns for context-aware suggestions
- **Learning System** - Improves suggestions based on user corrections
- **Visual Feedback** - Dropdown suggestions with confidence percentages and explanations

### Advanced Features
- **Multi-Sheet Workbooks** - Full support for multiple sheets with cross-sheet formulas
- **Conditional Formatting** - Color scales, data bars, icon sets, and custom rules
- **Data Validation** - Dropdown lists, range constraints, and custom validation rules
- **Pivot Tables** - Drag-and-drop builder with aggregation functions
- **Advanced Charts** - Waterfall, Gantt, heatmap, treemap, and candlestick charts using ECharts
- **Formula Debugger** - AI-powered error detection with step-by-step execution visualization
- **Macro System** - Record and playback actions for automation
- **Comment Threads** - Cell annotations with @mentions and resolved/unresolved status
- **Drawing Tools** - Shapes, arrows, text boxes, and freehand drawing for presentations

### Data Management
- **Search & Replace** - Global search across sheets with regex support
- **Data Cleaning Wizard** - AI-powered duplicate detection, outlier identification, and quality scoring
- **Dashboard Builder** - Create custom KPI dashboards with live-updating metrics
- **Spreadsheet Comparison** - Side-by-side diff viewer with merge capabilities
- **Natural Language Queries** - Ask questions about your data in plain English
- **Formula Library** - 20+ pre-built formula snippets organized by category

### Integrations
- **API Marketplace** - Pre-built connectors for:
  - Salesforce
  - QuickBooks
  - Google Analytics
  - SQL Databases
  - Custom API builder
- **Scheduled Reports** - Automated PDF/Excel generation with email distribution
- **File Storage** - S3 integration for spreadsheet persistence

### User Experience
- **Keyboard Shortcuts** - Excel-like hotkeys (Ctrl+C/V/Z/Y/S/F, F2, Tab, arrows)
- **AI Insights Panel** - Automatic anomaly detection, trend analysis, and forecasting
- **Freeze Panes** - Lock rows and columns while scrolling
- **Named Ranges** - Define and manage cell range names for readable formulas
- **Filtering & Sorting** - Multi-column filters with AI-powered suggestions

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Wouter** - Routing
- **tRPC** - End-to-end type-safe APIs
- **Socket.IO Client** - Real-time collaboration
- **ECharts** - Advanced charting
- **Recharts** - Basic visualizations
- **hot-formula-parser** - Excel formula execution

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Web server
- **tRPC 11** - API layer
- **Socket.IO** - WebSocket server
- **Drizzle ORM** - Database toolkit
- **MySQL/TiDB** - Database
- **Multer** - File uploads
- **XLSX** - Excel file processing

### AI & Services
- **OpenAI API** - Natural language processing and formula generation
- **Manus Built-in APIs** - LLM, storage, and authentication services

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm
- MySQL or TiDB database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mikepardo/excel-ai-agent.git
cd excel-ai-agent
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication (Manus OAuth)
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# AI Services
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

4. Push database schema:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

6. Open http://localhost:3000

### Running Tests
```bash
pnpm test
```

## Project Structure

```
excel-ai-agent/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── lib/          # Utilities (formula engine, data assistant)
│       ├── pages/        # Page components
│       └── hooks/        # Custom React hooks
├── server/                # Backend Express + tRPC
│   ├── _core/            # Framework core (OAuth, context, server)
│   ├── routers.ts        # tRPC API routes
│   ├── db.ts             # Database queries
│   ├── aiAgent.ts        # AI command processing
│   ├── excelProcessor.ts # Excel file parsing
│   └── *.test.ts         # Vitest tests
├── drizzle/              # Database schema and migrations
│   └── schema.ts
├── shared/               # Shared types and constants
└── storage/              # S3 storage helpers
```

## Key Components

### InteractiveSpreadsheet
The main spreadsheet grid component with:
- Double-click cell editing
- Formula bar
- Real-time formula calculation
- AI-powered autocomplete suggestions
- Visual feedback for formulas and suggestions

### FormulaEngine
JavaScript-based Excel formula parser and calculator:
- Dependency graph building
- Topological sort for calculation order
- Cell reference resolution
- Circular reference detection
- Error handling

### DataEntryAssistant
AI-powered autocomplete system:
- Pattern detection from existing data
- Data type classification
- Column relationship analysis
- Confidence-scored suggestions
- Learning from user corrections

## API Documentation

### tRPC Procedures

#### Spreadsheet Operations
- `spreadsheet.create` - Create new spreadsheet
- `spreadsheet.list` - List user's spreadsheets
- `spreadsheet.get` - Get spreadsheet by ID
- `spreadsheet.update` - Update spreadsheet data
- `spreadsheet.delete` - Delete spreadsheet

#### Chat Operations
- `chat.sendMessage` - Send AI command
- `chat.getMessages` - Get chat history

#### Checkpoint Operations
- `checkpoint.create` - Save version
- `checkpoint.list` - List versions
- `checkpoint.restore` - Revert to version

#### Template Operations
- `template.list` - Get available templates
- `template.create` - Create from template

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [tryshortcut.ai](https://www.tryshortcut.ai)
- Built with [Manus](https://manus.im) development platform
- Formula parsing powered by [hot-formula-parser](https://github.com/handsontable/formula-parser)

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.

---

**Live Demo**: [Excel AI Agent](https://excel-ai-agent.manus.space)

**Repository**: https://github.com/mikepardo/excel-ai-agent
